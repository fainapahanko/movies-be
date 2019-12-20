const express = require("express")
const path = require("path")
const fs = require("fs-extra")
const router = express.Router()
const request = require("request")
const generatePdf = require("../lib/pdfMaker")
const sgMail = require('@sendgrid/mail');

router.get("/", async(req,res) => {
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
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const pathToAttachment = path.join(__dirname,`../../public/pdfs/${name}.pdf`)
    const myAttachment = fs.readFileSync(pathToAttachment, 'base64')
    const msg = {
        to: req.query.email,
        from: 'fpahanko@st.swps.edu.pl',
        subject: 'hello',
        text: 'yo',
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
    res.send("OK")
})
//catalogue?title=Harry&email=f.poganko@gmail.com


module.exports = router