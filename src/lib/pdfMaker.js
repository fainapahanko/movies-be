const pdfMaker = require("pdfmake")
const template = require("./pdfTemplate")
const path = require("path")
const fs = require("fs-extra")

const generatePdf = (moviesArray, name) => 
    new Promise((resolve, reject) => {
        try{
            var fonts = {
                Roboto: {
                  normal: "Helvetica",
                  bold: "Helvetica-Bold",
                  italics: "Helvetica-Oblique",
                  bolditalics: "Helvetica-BoldOblique"
                }
            };
            var printer = new pdfMaker(fonts)
            const pdfTemplate = template(moviesArray)
            const pdfStream = printer.createPdfKitDocument(pdfTemplate, {})
            const filePath = path.join(__dirname,`../../public/pdfs/${name}.pdf`)
            pdfStream.pipe(fs.createWriteStream(filePath))
            pdfStream.end()
            resolve()
        } catch(err){
            console.log(err)
            reject(err)
        }
    }
)

module.exports = generatePdf