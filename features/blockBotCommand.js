const isPriviledged = require('../util/isPriviledged')
const interp = require('../util/interpretCommand')

const fs = require('fs')

module.exports = (client) => {

    let blockFile  = './storage/blockList.json'
    let blockList  = []
    
    let reload = () => { blockList = JSON.parse( fs.readFileSync(blockFile) )} 

    let block      = false
    let blockWhere = ""
    let offender   = ""
    
    
    client.on('message', async (msg) => {

        let cmd = interp(msg.content, true)
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
        if (cmd && cmd.base === "show" && isPriviledged(msg)) {
            reload()
            await msg.channel.send("Blocked bot commands:")

            let counter = 1
            for (const message of blockList){
                await msg.channel.send(`${counter} - ${message}`)
                counter++
            }
        }

        // Bot command response to block
        if (cmd && cmd.base === "block" && isPriviledged(msg)) {
            if (isPriviledged(msg)) {

                if (typeof cmd.args[1] === 'undefined' ) {
                    await msg.reply("Expected two arguments")
                    return false
                }

                let content = cmd.args[0].concat(" "+cmd.args[1])

                reload()

                //Is the command already in the list?
                if (blockList.indexOf(content) !== -1) {
                    await msg.reply("Blocked command already exists")
                    return false
                }
                    
                
                blockList.push(content)
    
                fs.writeFile(blockFile, JSON.stringify(blockList), err => {
                    if (err) console.log(err)
                })

                await msg.reply("Added yasta")
            }
        }

        // Bot command index to unblock
        if (cmd && cmd.base === "unblock" && isPriviledged(msg)) {
            if (isPriviledged(msg)) {

                let content = Number(cmd.args[0])
                reload()

                //Find it and remove it
                if (content > 0 && content <= blockList.length) {
                    blockList.splice(content-1,1)

                    fs.writeFile(blockFile, JSON.stringify(blockList), err => {
                        if (err) console.log(err)
                    })
    
                    await msg.reply("Removed yasta")
                }
                else
                    tempMsg("Out of bounds", 2000, msg)
            }
        }
    })
}



