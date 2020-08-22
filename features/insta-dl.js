const ask = require('../util/ask')
const interp = require('../util/interpretCommand')

const {installMouseHelper} = require('../util/installMouseHelper')
const fs = require('fs')
const bent = require('bent')
const getBuffer = bent('buffer')
const puppeteer = require('puppeteer')
const getUser = require('../util/getUser')
const Discord = require('discord.js')

module.exports = (client) => {
    
    client.on('message', async (msg) => {
    
        let cmd = interp(msg.content, true)

        if (cmd && cmd.base === "control" && !msg.author.bot) {

            const browser = await puppeteer.launch({headless: false})
            
            const page = await browser.newPage()

            await msg.reply("Beginning remote control")
            await page.screenshot({path:`./public/screenControl.png`})
            let screen = await msg.channel.send(new Discord.MessageEmbed()
                .setImage('https://bot-dot.herokuapp.com/?pic=screenControl')
            )


            //Getting user input
            let questions = setInterval(async() => {
                await ask("What do you want to do?")
                          .then(answer => {
                                if (answer === "stop") {
                                    return false
                                }
                          })
            }, 6000);

            // Embed/Screen refresh interval code //

            let counter = 0
            let printScreen = setInterval(async() => {

                await page.screenshot({path:`./public/screenControl${counter}.png`})
                .then(async()=>{
                    await screen.edit(
                        new Discord.MessageEmbed()
                        .setImage(`https://bot-dot.herokuapp.com/?pic=screenControl${counter}`)
                    )
                    console.log("updated")
                })

                counter++

                let cleanUp = setInterval(async() => {
                    if (!printScreen.hasRef())
                        cleanUp.unref()
                    if (counter > 0 && fs.existsSync(`./public/screenControl${counter-1}.png`))
                        fs.unlinkSync(`./public/screenControl${counter-1}.png`)
                }, 3000);
            }, 3000);
        }

        if (cmd && cmd.base === "dl" && !msg.author.bot) {

            let reply1 = await msg.channel.send("Searching..")

            await msg.delete()

            let download = cmd.args[0]
            
            const browser = await puppeteer.launch({
                headless: false
                // args: [ '--proxy-server=http://41.210.161.114:80' ]
            })
            
            const page = await browser.newPage()

            let url

            let reqListen = page.on('request', async request => {
                if (request.resourceType() === 'media') 
                {
                    
                    await page.waitForResponse(response => response.url() != null).catch(async err =>{
                        console.log("Response wait error: "+err)
                        await msg.reply("Couldn't get the video. Try again or contact dev")
                        browser.close()
                        return false
                    })

                    reqListen.removeListener()

                    await reply1.delete()
                    let reply2 = await msg.reply("Found media request")

                    url = request.response().url()

                    if (url) {
                        // await msg.reply("Got something...")
        
                        let reply3 = await msg.reply("Will try to download")
        
                        let buf = await getBuffer(url)

                        fs.writeFileSync("./video.mp4", buf)

                        // await msg.reply("file saved. check it out")
                        
                        await msg.channel.send({
                            files: ['./video.mp4']
                        })
        
                        await reply2.delete()
                        await reply3.delete()

                        fs.unlinkSync("./video.mp4")

                        await browser.close()
                    }
                }
            })

            //Needs login?
            let reqListen2 = page.on('load', async () => {

                url = page.url().includes("/login/")

                if(url) {

                    let dm = await getUser("OWNER",client)[0].createDM()
                    
                    //begin remote browser control
                    await dm.send("Beginning remote control")
                    let screen = await dm.send("Screen")

                    let printScreen = setInterval(async() => {
                        await page.screenshot({path:"screenControl.png"})
                        await screen.edit({
                            files: ['./screenControl.png']
                        })
                    }, 1000);

                }
            })

            await page.setViewport({
                width:  1920,
                height: 1080
            })

            // await installMouseHelper(page);

            //download
            // await page.goto(download,{
            //  timeout: 0,
            //  waitUntil: 'networkidle2'
            // })
            // .catch(async()=>{
            //     msg.reply("Network error")
            //     browser.close()
            //     return false
            // }).then(async()=>{
            //     await page.mouse.click(700,400)
            //     await page.mouse.click(700,400)
            //     await page.mouse.click(700,400)
            //     await page.mouse.click(700,400)
            // })
        }
    }) 
}