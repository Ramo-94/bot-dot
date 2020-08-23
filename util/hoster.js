const http = require('http')
const { URL } = require('url');
const fs = require('fs')

module.exports = () => {
    //Image server to work on Discord's rich embed refresh issue
    let server = http.createServer((req,res)=>{

        let fullUrl = req.socket.address()
        console.log("Log url: ",fullUrl)
        let url = new URL(`https://${fullUrl.address}:${fullUrl.port}${req.url.substring(1)}`)
        let pic = url.searchParams.get('pic')

        let stream = fs.createReadStream(`./public/${pic}.png`)
        stream.on('open',() => {
            res.setHeader("Content-Type","image/png")
            stream.pipe(res)
        })
    })

    server.listen(3000,'localhost')
}