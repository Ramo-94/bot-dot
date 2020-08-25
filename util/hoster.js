const express = require('express')
const app = express()
const path = require('path')
const { PORT } = require('../variables')

module.exports = () => {


    //Image server to work on Discord's rich embed refresh issue

    app.use(express.static(path.join(__dirname, '../public')))
    
    app.listen(PORT)

    console.log("Server started listening on " + PORT)
}