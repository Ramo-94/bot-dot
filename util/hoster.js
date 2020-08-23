const express = require('express')
const app = express()
const port = process.env.PORT
const path = require('path');

module.exports = () => {


    //Image server to work on Discord's rich embed refresh issue

    app.use(express.static(path.join(__dirname, '../public')))
    
    app.listen(port)

    console.log("Server started listening on " + port)
}