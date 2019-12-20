const template = moviesArray => {
    
    const pdfBody = {
        body: [],
        width: [100,400,]
    }
    if(moviesArray.length > 1){
        moviesArray.map(el => (pdfBody.body.push([`${el.Year}`, `${el.Title}`])))
    }

    return {
        content: [
            {text: "List of movies", style: "header"},
            {table: pdfBody}
        ]
    }
}

module.exports = template