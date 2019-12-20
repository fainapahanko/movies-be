const express = require("express")
const multer = require("multer")
const fs = require("fs-extra")
const path = require("path")
const uuid = require("uuid/v1")
const {getReviews, writeReviews} = require("../../data/helpers")
const router = express.Router()

router.get("/", async(req,res) => {
    const reviews = await getReviews()
    if(req.query.length>0){
        const fl = reviews.filter(rw => rw.elementId === req.query.elementId)
        res.status(200).send(fl)
    }
    res.status(200).send(reviews)
})

router.get("/:id", async(req,res) => {
    const reviews = await getReviews()
    const review = reviews.find(review => review._id === req.params.id)
    if(review){
        return res.status(200).send(review)
    } else {
        return res.status(404).send("not found")
    }
})
const upload = multer({})
router.post("/:imdbID",upload.single('image'), async(req,res) => {
    const reviews = await getReviews()
    const review = {
        ...req.body,
        _id: uuid(),
        createdAt: new Date(),
        elementId: req.params.imdbID
    }
    const imgPath = path.join(__dirname,"../../public/img/" + review._id + ".jpg")
    await fs.writeFile(imgPath, req.file.buffer)
    review.image = imgPath
    reviews.push(review)
    await writeReviews(reviews)
    res.status(200).send(review)
})

router.put("/:id", async(req,res) => {
    const reviews = await getReviews()
    const review = reviews.find(review => review._id === req.params.id)
    const position = reviews.indexOf(review)
    const obj = Object.assign(review, req.body)
    reviews[position] = obj
    await writeReviews(reviews)
    return res.status(200).send(obj)
})

router.delete("/:id", async(req,res) => {
    const reviews = await getReviews()
    const filtered = reviews.filter(review => review._id !== req.params.id)
    if(filtered.length === reviews.length){
        return res.status(404).send("not found")
    } else{
        await writeMedia(filtered)
        return res.status(200).send("OK")
    }
})

module.exports = router