const http = require('http')
const { URL } = require('url');
const fs = require('fs')

module.exports = () => {
    //Image server to work on Discord's rich embed refresh issue
    let server = http.createServer((req,res)=>{

    

        let pic
        for (let i = 0; i < req.rawHeaders.length; i++) {
            if (req.rawHeaders[i] === "pic")
            pic = req.rawHeaders[i+1]
            break;
        }
        
        console.log("Log pic: ", pic)

        let stream = fs.createReadStream(`./public/${pic}.png`)
        stream.on('open',() => {
            res.setHeader("Content-Type","image/png")
            stream.pipe(res)


            stream.on('end', ()=>{
                stream.close()
                res.end()
            })

            res.on('close', ()=>{
                console.log("ended")
            })
        })

    })

    server.listen(process.env.PORT)

    console.log("Server started listening on " + process.env.PORT)
}