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

const Discord      = require('discord.js')
const { prefix }   = require('../settings')
const isPrivileged = require('../util/isPrivileged')

module.exports = (client) => {

    let glblmsg

    client.on('message', async msg => {
        glblmsg = msg
        if (isOnlyMention(msg.content) && !msg.author.bot) 
            await msg.channel.send({embed: makeEmbed()})
    })

    // Check if the content of the message is just the bot mentioned
    function isOnlyMention(content) {
        return content.replace('!','') === client.user.toString()
    }


    function makeEmbed() {
        let embed = new Discord.MessageEmbed()
        .setTitle(`Prefix: ${prefix}`)
        .setAuthor("Help - Dot-bot")
        .setDescription("Here's what I can do: ")
        .addFields(
            { name: ":arrow_double_down: dl", value: "Download videos from Tiktok or Instagram"},
            { name: ":grey_question: ping"  , value: "Check my stats"                          },
        )

        if (isPrivileged(glblmsg)) {
            embed
            .addFields
                (
                    {name: ":no_entry: block"          , value: "Block a bot's response to a command"  },
                    {name: ":white_check_mark: unblock", value: "Unblock a bot's response to a command"},
                    {name: ":printer: show"            , value:  "Show a list of blocked responses"    }
                )
        }

        return embed
    }

}