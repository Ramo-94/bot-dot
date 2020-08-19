const Discord = require('discord.js')
const client = new Discord.Client()

//UnComment line below to switch between
//envrionment variable token or local
//token in token.js file for local testing

// const { token } = require("./token");

const features = [
                    require('./features/blockBotCommand')  , require('./features/addToBlock'),
                    require('./features/insta-dl')         , require('./features/antiRaid')  ,
                    require('./features/unblockBotCommand'),
                 ]

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

features.map( feature => feature(client) )


if (typeof token === 'undefined')
  client.login(process.env.TOKEN)
else
  client.login(token)
