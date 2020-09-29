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

const Discord  = require('discord.js')

const interpret = require('../util/interpretCommand')

module.exports = async (client, msg, cmd) => {
    
    if (cmd && cmd.base == "ping") {
        let ping         = Math.abs(msg.createdTimestamp - Date.now()) + 'ms'
        let rss          = (process.memoryUsage().rss / 1e+6).toFixed(2) + "MB"
        let guildsNum    = client.guilds.cache.size
        let usersNum     = userCount()
        
    let embed = new Discord.MessageEmbed()
        .addFields(
            {name: "Servers", value: guildsNum, inline: true},
            {name: "Users"  , value: usersNum , inline: true},
            {name: "Memory" , value: rss      , inline: true},
            {name: "Ping"   , value: ping     , inline: true}
        )

        await msg.channel.send({embed})
    }

    function userCount() {
        let total = 0
        client.guilds.cache.mapValues(e => { 
            e.members.cache.mapValues(e=>{ if(!e.user.bot) total++})
        })
        return total
    }
}