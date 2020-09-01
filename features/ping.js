const Discord  = require('discord.js')

const interpret = require('../util/interpretCommand')

module.exports = (client) => {
    
    client.on('message', async msg => {

        let cmd = interpret(msg.content, false)

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

    })

    function userCount() {
        let total = 0
        client.guilds.cache.mapValues(e => { 
            e.members.cache.mapValues(e=>{ if(!e.user.bot) total++})
        })
        return total
    }
}