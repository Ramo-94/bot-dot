const MSGS      = require('../messages')
const interpret = require('../util/interpretCommand')
const enqueuer  = require('../util/TaskEnqueuer')
const tempMsg   = require('../util/tempMsg')

const {installMouseHelper} = require('../util/installMouseHelper')
const fs                   = require('fs')
const bent                 = require('bent')
const getBuffer            = bent('buffer')
const puppeteer            = require('puppeteer-extra')
const StealthPlugin        = require('puppeteer-extra-plugin-stealth')
const getUser              = require('../util/getUser')
const Discord              = require('discord.js')
const { execSync }         = require('child_process')


module.exports = (client) => {

    let queue = new enqueuer(client, "message", 3)
    puppeteer.use(StealthPlugin())
    let glblmsg

    client.on('message', async (msg) => {
        
        glblmsg = msg
        let cmd = interpret(msg.content, true)
        // Browser and page launch options
        let brwsrOptns = {headless: true, args:[ '--no-sandbox','--disable-setuid-sandbox' ]}
        let pageVwprt = {width: 1920, height: 1080}
        // Options object for page nav timeouts
        let pageWait = {timeout: 0, waitUntil: 'networkidle2'}


        // Download command
        if (cmd && cmd.base === "dl" && !msg.author.bot) {

            if (!queue.isFull()) {

                queue.enqueue(msg)

                // Setup download status updates
                const status = updateStatus(msg)
                status.next()
                
                // Embed for download information
                let downloadEmbed = new Discord.MessageEmbed()
                .setTitle(MSGS.DOWNLOAD_LINK)
                .setAuthor("By " + msg.author.username, msg.author.avatarURL())
                .setURL(cmd.args[0])
                .setColor(getUser(msg,client).displayColor)

                // Whether to start listening for media requests from tiktok
                let waitTiktok = false

                let browser = await puppeteer.launch(brwsrOptns)
                let page = await browser.newPage()
                await page.setViewport(pageVwprt)                  

                // Shows mouse clearly on headful debugging
                    // await installMouseHelper(page) //

                // Initial command clean up and response from discord chat
                status.next()
                await msg.delete()


                // Start listener for page media requests
                let reqListen = page.on('request', async request => {
    
                    if (request.resourceType() === 'media' && request.method() == "GET" && !waitTiktok) {
    
                        let url = request.url()
    
                        //Remove this listener after getting the needed request
                        page.removeListener('request', reqListen)
    
                        if (url) {

                            status.next()
    
                            //Get mp4 buffer using bent
                            let buf = await getBuffer(url)
                            let size = (buf.byteLength / 1e+6).toFixed(2) // size in MB
    
                            console.log("SIZE: "+ size)

                            if (size < 25){
                                fs.writeFileSync("./video.mp4", buf)

                                //Determine if compression is necessary
                                if (size > 8) {
                                    headsup(MSGS.NEEDS_COMPRESSION, 2000, glblmsg)
        
                                    fs.copyFileSync("./video.mp4","./copyEdit.mp4")
                                    execSync(`ffmpeg -i ./copyEdit.mp4 -vcodec libx264 -crf 32 -y ./video.mp4`, async err => {
                                        if (err) {
                                            console.log(`err: ${err}`)
                                            headsup(MSGS.COMPRESSION_ERROR, 2000, glblmsg)
                                            await browser.close()
                                            queue.dequeue()
                                        }
                                    })
                                }

                                status.next()

                                // Recalculate size after compression
                                size = (fs.statSync("./video.mp4")["size"] / 1e+6).toFixed(2)
                                if (size > 8) {
                                    headsup(MSGS.COMPRESSION_LARGE, 2000, glblmsg)
                                    await browser.close()
                                }
                                else {

                                    await msg.channel.send({
                                        files: ['./video.mp4'],
                                        embed: downloadEmbed
                                    })
    
                                    if (fs.existsSync("./video.mp4")) 
                                        fs.unlinkSync("./video.mp4")
                                }

                                queue.dequeue()
                                await browser.close()
                            }      
                            else {
                                headsup(MSGS.COMPRESSION_LARGE, 2000, glblmsg)
                                await browser.close()
                                queue.dequeue()
                            }
                        }
                    }
                })


                // Is the requested video from Instagram ?
                if (regTests('iNormal').test(cmd.args[0])) {
    
                    // Navigate to the download page
                    // and wait till everything is loaded
                    await page.goto(cmd.args[0],{pageWait})
                    .catch(async()=>{

                        headsup(MSGS.NAV_ERROR, 2000, glblmsg)
                        await browser.close()
                        queue.dequeue()
                    })
    
                    // Click video to load media request
                    await page.click('div[class="fXIG0"]').catch(async ()=>{console.log("=== BUTTON NOT FOUND ===")})
                }
    
                // Is the requested video from Tiktok ?
                else if (regTests("tNormal").test(cmd.args[0]) || regTests("tVm").test(cmd.args[0]) || regTests("tForyou").test(cmd.args[0])) {
                    
                    // Prevent request listener from listening
                    // to media requests for now
                    waitTiktok = true

                    // Whether the video is from the "for you" page or has "vm" in link
                    let foryou = regTests("tForyou").test(cmd.args[0])
                    let vm = regTests("tVm").test(cmd.args[0])
                    let video = cmd.args[0]
    
                    if (foryou) 
                        video = "https://www.tiktok.com/".concat(cmd.args[0].substring(cmd.args[0].indexOf("@")))
                    
                    if (vm) {
                        waitTiktok = false
                        
                        //Navigate to get normal full URL
                        await page.goto(cmd.args[0], {pageWait})
                            .catch(async()=>{
                                headsup(MSGS.NAV_ERROR, 2000, glblmsg)  
                                await browser.close()
                                queue.dequeue()
                            })
                        
                        await page.waitForNavigation({pageWait})
                            .catch(async()=>{
                                await browser.close()
                                queue.dequeue()
                            })
                        
                        video = await page.url()
                    }
                    
                    // Log requested link
                    console.log(cmd.args[0])

                    waitTiktok = false
                    await page.goto(video,{pageWait})
                    .catch(()=>{}) // Execution context will be destroyed, error is expected.
                }

                else 
                    headsup(MSGS.BAD_LINK, 2000, glblmsg)
            }
    
            // Notice when the download queue is full
            else {
                queue.enqueue(msg)
                let full = await msg.channel.send(MSGS.REQUEST_FULL)
                setTimeout(async () => {
                    await full.delete()
                }, 2000);
            }
        }
    
    })

    // util/alias functions

    async function * updateStatus(msg) {
        let message = await msg.channel.send(MSGS.REQUEST_ENQUEUED)
        yield await message.edit(MSGS.REQUEST_SEARCHING)
        yield await message.edit(MSGS.REQUEST_FOUND)
        yield await message.delete()
    }

    // URL Regexp validation
    function regTests(test) {
        switch (test) {
            // t for tiktok & i for instagram

            case "tNormal":
                return /^((https:\/\/)|(www.)|(https:\/\/www.))|tiktok.com(\/\@[\w\d]+)(\/video)(\/[\w\d]+)\?*[\w\d]*/g
            
            case "tVm":
                return /^(https:\/\/)?vm.tiktok.com\/([\w\d]+)\??[\w\d]*/g

            case "tForyou":
                return /^((https:\/\/)|(www.)|(https:\/\/www.))|tiktok.com(\/foryou(\?[\w\d]*\=[\w\d]*)?\#?)*(\/\@[\w\d]+)(\/video)(\/[\w\d]+)\?*[\w\d]*/g


            case "iNormal":
                return /^((https:\/\/www.)|(www.)|(https:\/\/)|^)instagram.com\/(p|tv)\/([\w\d]+)(\/|)[\w\d=?]*/g

            default:
                break;
        }
    }

}