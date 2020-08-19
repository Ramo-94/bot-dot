const ask = require('../util/ask')
const interp = require('../util/interpretCommand')

const {installMouseHelper} = require('../util/installMouseHelper');
const fs = require('fs')
const bent = require('bent')
const getBuffer = bent('buffer')
const puppeteer = require('puppeteer')

module.exports = (client) => {

    client.on('message', async (msg) => {
    
        let cmd = interp(msg.content, true)

        if (cmd && cmd.base === "dl" && !msg.author.bot) {

            let reply1 = await msg.channel.send("Searching..")

            await msg.delete()

            let download = cmd.args[0]
            
            const browser = await puppeteer.launch({
                headless: true
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

            await page.setViewport({
                width:  1920,
                height: 1080
            })

            await installMouseHelper(page);

            await page.goto(download,{
            timeout: 0,
             waitUntil: 'networkidle2'
            })
    
            // //Wants login?
            // if (await page.$('input[name="username"]') != null) {
              
            //     await page.type('input[name="username"]', process.env.USER)
            //     await page.type('input[name="password"]', process.env.PASS)
            //     await page.evaluate( () => {
            //         for(var i of document.getElementsByTagName("button"))
            //             if (i.getAttribute("type") == "submit")
            //                 i.click()
            //     })
                        
            //     await page.evaluate( () => {
            //       for(var i of document.getElementsByTagName("button"))
            //            if (i.innerText== "Send Security Code")
            //                 i.click()
            //     })
                
            //     msg.reply("Login required. I will DM the owner for a code.")

            //     let code
            //     ask(client,"Please give me instagram code", msg)
            //     .then(res => {code = res})
            //     .catch(async () => {await msg.reply("No response, please try again later")})
                
            // }

            await page.mouse.click(700,400)
            await page.mouse.click(700,400)
            await page.mouse.click(700,400)
            await page.mouse.click(700,400)
        }
    }) 
    }

