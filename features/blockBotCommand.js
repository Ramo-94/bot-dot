const isPrivileged = require('../util/isPrivileged')
const interp = require('../util/interpretCommand')

// =================================================================
// Copyright [2020] [Omar Ibrahim]

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// =================================================================

const fs = require('fs')

module.exports = async (client, msg, cmd) => {

    let blockFile  = './storage/blockList.json'
    let blockList  = []
    
    let reload = () => { blockList = JSON.parse( fs.readFileSync(blockFile) )} 

    let block      = false
    let blockWhere = ""
    let offender   = ""
    

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
    if (cmd && cmd.base === "show" && isPrivileged(msg)) {
        reload()
        await msg.channel.send("Blocked bot commands:")

        let counter = 1
        for (const message of blockList){
            await msg.channel.send(`${counter} - ${message}`)
            counter++
        }
    }

    // Bot command response to block
    if (cmd && cmd.base === "block" && isPrivileged(msg)) {
        if (isPrivileged(msg)) {

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
    if (cmd && cmd.base === "unblock" && isPrivileged(msg)) {
        if (isPrivileged(msg)) {

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
}



