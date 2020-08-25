const isPriviledged = require('../util/isPriviledged')
const getUser = require('../util/getUser')
const interp = require('../util/interpretCommand')

const fs = require('fs')

module.exports = (client) => {

    let blockFile  = './storage/blockList.json'
    let blockList  = []
    
    let reload = () => { blockList = JSON.parse( fs.readFileSync(blockFile) )} 

    client.on('message', async (msg) => {
        let cmd = interp(msg.content,true)

        if (cmd.base === "unblock") {
            if (isPriviledged(getUser(msg))) {
                if (typeof cmd.args[1] === 'undefined' ) {
                    await msg.reply("Expected two arguments")
                    return false
                }

                let content = cmd.args[0].concat(" "+cmd.args[1])

                reload()

                //Find it and remove it
                blockList.splice(blockList.indexOf(content),1)

                fs.writeFile(blockFile, JSON.stringify(blockList), err => {
                    if (err) console.log(err)
                })

                await msg.reply("Removed yasta")
            }
        }
    })

}