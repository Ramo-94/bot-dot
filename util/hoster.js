const http = require('http')
const { URL } = require('url');
const fs = require('fs')

module.exports = () => {
    //Image server to work on Discord's rich embed refresh issue
    let server = http.createServer((req,res)=>{

        let fullUrl = req.socket.address()
        console.log("Log url: ",fullUrl)
        
        if (fullUrl.includes('?pic=')) 
            let picIndex = req.socket.address().indexOf("?pic=")
        let pic = fullUrl.substring(picIndex)
        console.log("Log pic: ", pic)

        let stream = fs.createReadStream(`./public/${pic}.png`)
        stream.on('open',() => {
            res.setHeader("Content-Type","image/png")
            stream.pipe(res)
        })
    })

    server.listen(process.env.PORT)

    console.log("Server started listening on " + process.env.PORT)
}