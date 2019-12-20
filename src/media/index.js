const express = require("express")
const multer = require("multer")
const {getMedia, writeMedia, getReviews} = require("../../data/helpers")
const {check, validationResult} = require("express-validator")
const path = require("path")
const fs = require("fs-extra")
const router = express.Router()
const request = require("request")
const generatePdf = require("../lib/pdfMaker")
const sgMail = require('@sendgrid/mail');

router.get("/", async(req,res) => {
    if(req.query.length>0){
        request({
            method: 'GET',
            url: 'http://www.omdbapi.com/?apikey=ad6a24df&s=' + req.query
        }, function (error, response, body){
            if(!error && response.statusCode == 200){
              return res.status(200).send(JSON.parse(body));
            }
         })
    } else {
        res.status(200).send(await getMedia())
    }
})

router.get("/:imdbID", async(req,res) => {
    request({
        method: 'GET',
        url: 'http://www.omdbapi.com/?apikey=ad6a24df&i=' + req.params.imdbID
      }, function (error, response, body){
        if(!error && response.statusCode == 200){
            return res.status(200).send(JSON.parse(body));
        }
     })
})

router.get("/:elementId/reviews", async(req,res) => {
    const reviews = await getReviews()
    const reviewsForSpecificFilm = reviews.filter(review => review.elementId === req.params.elementId)
     res.status(200).send(reviewsForSpecificFilm)
})

router.post("/catalogue", async(req,res) => {
    const name = req.query.title
    request({
        method: 'GET',
        url: 'http://www.omdbapi.com/?apikey=ad6a24df&s=' + name
      }, async (error, response, body) => {
        if(!error && response.statusCode == 200){
            const movies = await JSON.parse(body)
            const moviesArray = movies.Search
            await generatePdf(moviesArray, name)
          };
        }
    )
    await sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const pathToAttachment = path.join(__dirname,`../../public/pdfs/${name}.pdf`)
    const myAttachment = fs.readFileSync(pathToAttachment, 'base64')
    const msg = {
        to: req.query.email,
        from: 'fpahanko@st.swps.edu.pl',
        subject: 'hello',
        text: 'thank you for using our service',
        attachments: [
            {
                content: myAttachment,
                filename: `${name}.pdf`,
                type: "application/pdf",
                disposition: "attachment"
            }
        ]
    };
    sgMail.send(msg).catch(err => {
        console.log(err);
    });
     res.status(200).send("OK")
})
//catalogue?title=Harry&email=f.poganko@gmail.com

router.post("/",[
    check("Title")
        .exists().isLength({min: 4, max: 100}).withMessage("Title is mandatory")
], async(req,res) => {
    const movies = await getMedia()
    const movie = {
        ...req.body
    }
    const duplicat = movies.find(movie => movie.imdbID === req.body.imdbID)
    if(duplicat){
        return res.send("ImdbID should be unique")
    }
    const err = validationResult(req)
    if(!err.isEmpty()){
        return res.status(422).send("Something went wrong")
    }
    movies.push(movie)
    await writeMedia(movies)
     res.status(200).send(movie)
})

router.put("/:imdbID", async(req,res) => {
    const movies = await getMedia()
    const movie = movies.find(movie => movie.imdbID === req.body.imdbID)
    const position = movies.indexOf(movie)
    const obj = Object.assign(movie, req.body)
    movies[position] = obj
    await writeMedia(movies)
    res.status(200).send(obj)
})

router.delete("/:imdbID", async(req,res) => {
    const movies = await getMedia()
    const filtered = movies.filter(movie => movie.imdbID !== req.params.imdbID)
    if(filtered.length === movies.length){
        return res.status(404).send("not found")
    } else{
        await writeMedia(filtered)
        res.status(200).send("OK")
    }
})

module.exports = router