const express = require("express")
const server = express()
const mediaRouter = require("./src/media/index")
const reviewsRouter = require("./src/reviews/index")
const catalogueRouter = require("./src/emailSend/index")
const cors = require("cors")
require('dotenv').config()
server.use(express.json())
server.use(cors())

// var whitelist = ['http://localhost:3000', 'http://localhost:3001']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//         return callback(null, true)
//     } else {
//         return callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
server.use(express.static("./public/img"))
server.use("/media", mediaRouter)
server.use("/reviews",reviewsRouter)
server.use("/catalogue",catalogueRouter)

const port = process.env.PORT || 3333
server.listen(port, () => {
    console.log("we are running on localhost " + port)
})