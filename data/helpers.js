const path = require("path")
const fs =require("fs-extra")

const mediaPath = path.join(__dirname,"media.json")
const reviewsPath = path.join(__dirname,"reviews.json")

module.exports = {
    getMedia: async() => {
        const buffer = await fs.readFile(mediaPath)
        return JSON.parse(buffer.toString())
    },
    getReviews: async() => {
        const buffer = await fs.readFile(reviewsPath)
        return JSON.parse(buffer.toString())
    },
    writeMedia: async(data) => {
        await fs.writeFile(mediaPath, JSON.stringify(data))
    },
    writeReviews: async(data) => {
        await fs.writeFile(reviewsPath, JSON.stringify(data))
    }
}