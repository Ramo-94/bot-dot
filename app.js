const Discord = require('discord.js')
const client = new Discord.Client()
const { TOKEN } = require('./variables')

const features = [
                    require('./features/blockBotCommand')   , require('./features/addToBlock'),
                    require('./features/insta-dl')          , require('./features/antiRaid')  ,
                    require('./features/unblockBotCommand')       
                 ]

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

features.map( feature => feature(client) )

client.login(TOKEN)
