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

const MSGS = require('../../messages')
const enqueuer = require('../../util/TaskEnqueuer')
const tempMsg = require('../../util/tempMsg')
const getProxy = require('../../util/Proxy')

const getUser = require('../../util/getUser')
const Discord = require('discord.js')
const Browser = require('./Browser')

module.exports = async (client, msg, cmd) => {

    let queue = new enqueuer(client, "message", 3)

    // Download command
    if (cmd && cmd.base === "dl" && !msg.author.bot) {

        if (typeof cmd.args !== "undefined" && cmd.args[1])
            var printPage = (cmd.args[1] == "print" ? true : false)

        if (!queue.isFull()) {
            
            // If the link is a tiktok link
            if (regTests("tNormal").test(cmd.args[0]) || regTests("tVm").test(cmd.args[0]) || regTests("tForyou").test(cmd.args[0])) {

                queue.enqueue(msg)
                await tempMsg(MSGS.REQUEST_ENQUEUED, 5000, msg)
                // let proxy = await getProxy()

                let downloadEmbed = new Discord.MessageEmbed()
                    .setTitle(MSGS.DOWNLOAD_LINK)
                    .setAuthor("By " + msg.author.username, msg.author.avatarURL())
                    .setURL(cmd.args[0])
                    .setColor(getUser(msg, client).displayColor)

                let browser = new Browser(false, false, [], msg, printPage)

                browser.onDownloaded(async () => {
                    await msg.channel.send({
                        files: ['./video.mp4'],
                        embed: downloadEmbed
                    })
                    browser.cleanup()
                    browser.close()
                    browser = null
                })

                await browser.get(cmd.args[0])

                queue.dequeue()

            } else tempMsg(MSGS.BAD_LINK, 5000, msg)

        } else tempMsg(MSGS.REQUEST_FULL, 5000, msg)
    }

}

// URL Regexp validation
function regTests(test) {
    switch (test) {
        // t for tiktok

        case "tNormal":
            return /^(https:\/\/|www.|https:\/\/www.|)tiktok.com(\/\@[\w\d.]+)(\/video)(\/[\w\d]+)\?*[\w\d]*/g

        case "tVm":
            return /^(https:\/\/)?vm.tiktok.com\/([\w\d]+)\??[\w\d]*/g

        case "tForyou":
            return /^((https:\/\/)|(www.)|(https:\/\/www.)|)tiktok.com\/foryou((\?[\w\d]*\=[\w\d]*)?\#?)*(\/\@[\w\d]+)(\/video)(\/[\w\d]+)\?*[\w\d]*/g

        default:
            break;
    }
}