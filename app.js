const Discord = require('discord.js')
const client = new Discord.Client()
const { TOKEN } = require('./variables')

const features = [
                    require('./features/blockBotCommand'), require('./features/antiRaid'),
                    require('./features/insta-dl')     
                 ]

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

features.map( feature => feature(client) )

client.login(TOKEN)
