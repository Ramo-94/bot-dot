const ask = require('../util/ask')

const {installMouseHelper} = require('../util/installMouseHelper');
const fs = require('fs')
const bent = require('bent')
const getBuffer = bent('buffer')

module.exports = (client) => {
    
    const puppeteer = require('puppeteer')

    client.on('message', async (msg) => {
    
        if (msg.content === "garab keda yasta" && msg.author.username == "Omar") {

            const browser = await puppeteer.launch({
                headless:true
                // args: [ '--proxy-server=http://201.157.44.108:3128' ]
            })
            
            const page = await browser.newPage()

            let url

            let reqListen = page.on('request', async request => {
                if (request.resourceType() === 'media') 
                {

                    await msg.reply("Found media request")

                    if (typeof request.response() === 'null') {
                        await msg.reply("Error .. hold on .. ")
                        await page.waitFor(1000)
                        await page.mouse.click(700,400)

                        url = request.response().url()

                    }

                    url = request.response().url()

                    if (url) {
                        await msg.reply("Got something...")

                        await msg.reply("Will try to download")
    
                        let response = await getBuffer(url)
    
                        let buf = response
                        fs.writeFileSync("./video.mp4", buf)
                        await msg.reply("file saved. check it out")
                        
                        await msg.channel.send({
                            files: ['./video.mp4']
                        })
                    }
                }
            })

            await page.setViewport({
                width:  1920,
                height: 1080
            })

            await installMouseHelper(page);

            await page.goto('https://www.instagram.com/p/CDe2U11AcxH/',{
            timeout: 0,
             waitUntil: 'networkidle2'
            })
            
            
            //Wants login?
            if (await page.$('input[name="username"]') != null) {
              
                await page.type('input[name="username"]', process.env.USER)
                await page.type('input[name="password"]', process.env.PASS)
                await page.evaluate( () => {
                    for(var i of document.getElementsByTagName("button"))
                        if (i.getAttribute("type") == "submit")
                            i.click()
                })
                        
                await page.evaluate( () => {
                  for(var i of document.getElementsByTagName("button"))
                       if (i.innerText== "Send Security Code")
                            i.click()
                })
                
                msg.reply("Login required. I will DM the owner for a code.")

                let code
                ask(client,"Please give me instagram code", msg)
                .then(res => {code = res})
                .catch(async () => {await msg.reply("No response, please try again later")})
                
            }

            await page.mouse.click(700,400)
            await page.waitFor(500)
            await page.mouse.click(700,400)

            reqListen.removeListener()

            // await page.screenshot({path:"./test.png"})



            await msg.reply("done")

            }
        })
    }

