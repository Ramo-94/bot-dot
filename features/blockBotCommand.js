const isPriviledged = require('../util/isPriviledged')
const getUser = require('../util/getUser')
const interp = require('../util/interpretCommand')

const fs = require('fs')

module.exports = (client) => {

    

    let blockFile  = './storage/blockList.json'
    let blockList
    
    let reload = () => { blockList = JSON.parse( fs.readFileSync(blockFile) )} 

    let block      = false
    let blockWhere = ""
    let offender   = ""
    

    client.on('message', async (msg) => {

        let command = interp(msg.content, false)
        reload()
        blockList.map( async (element) => {

            if ( msg.content.startsWith(element) ) {
                block = true
                blockWhere = msg.channel.name
                offender = msg.author.id
            }
        })

        if (block && msg.author.bot && blockWhere === msg.channel.name && msg.author.username !== "Dot"){
            await msg.delete()
            block = false
        }

        //Check words currently in block list
        if (command && command.base === "show" && isPriviledged(getUser(msg))) {
            reload()
            await msg.channel.send("Blocked bot commands:")

            let counter = 1
            for (const message of blockList){
                await msg.channel.send(`${counter} - ${message}`)
                counter++
            }
        }
    })
}



