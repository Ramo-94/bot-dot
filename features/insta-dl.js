const MSGS = require('../messages')
const interpret = require('../util/interpretCommand')
const enqueuer = require('../util/TaskEnqueuer')

const {installMouseHelper} = require('../util/installMouseHelper')
const fs = require('fs')
const bent = require('bent')
const getBuffer = bent('buffer')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const getUser = require('../util/getUser')
const Discord = require('discord.js')
const { execSync } = require('child_process')


module.exports = (client) => {

    let queue = new enqueuer(client, "message", 3)

    client.on('message', async (msg) => {
        
        let cmd = interpret(msg.content, true)
 
        puppeteer.use(StealthPlugin())

        // Download command

        if (cmd && cmd.base === "dl" && !msg.author.bot) {

            if (!queue.isFull()) {

                queue.enqueue(msg)

                // Setup status updates
                const status = updateStatus(msg)
                status.next()
                
                let authorDM = await msg.author.createDM()

                // Embed for download information
                let downloadEmbed = new Discord.MessageEmbed()
                .setTitle(MSGS.DOWNLOAD_LINK)
                .setAuthor("By " + msg.author.username, msg.author.avatarURL())
                .setURL(cmd.args[0])
                .setColor(getUser(msg,client).displayColor)


                // Whether to start listening for media requests from tiktok
                let waitTiktok = false


                // Browser and page setup
                const browser = await puppeteer.launch({
                    headless: false,
                    args:[
                        '--no-sandbox',
                        '--disable-setuid-sandbox'
                        ]
                })
                const page = await browser.newPage()
                await page.setViewport({
                    width:  1920,
                    height: 1080
                })

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
    
                            //Calculate file size to determine whether to write to file
                            let size = (buf.byteLength / 1e+6).toFixed(2)
    
                            console.log("SIZE: "+ size)

                            if (size < 25) 
                                fs.writeFileSync("./video.mp4", buf)

                            //Determine if compression is necessary
                            let compressionMessage
                            if (size > 8) {
                                compressionMessage = await msg.channel.send(MSGS.NEEDS_COMPRESSION)
    
                                fs.copyFileSync("./video.mp4","./copyEdit.mp4")
                                execSync(`ffmpeg -i ./copyEdit.mp4 -vcodec libx264 -crf 32 -y ./video.mp4`, err => {
                                    if (err) 
                                        console.log(`err: ${err}`)
                                })
                            }
    
                            //Upload the file to discord
                            await msg.channel.send({
                                files: ['./video.mp4'],
                                embed: downloadEmbed
                            }).catch(async ()=>{
                                console.log("File too large")
                                await authorDM.send(MSGS.COMPRESSION_LARGE)
                                queue.dequeue()
                            })
    
                            status.next()
    
                            //Delete local video copy to save space
                            if (fs.existsSync("./video.mp4")) 
                                fs.unlinkSync("./video.mp4")
    
                            if (size > 8)
                                await compressionMessage.delete()
                            await browser.close()
                            queue.dequeue()
                        }
                    }
                })

                // URL Regexp validation
                let tiktokTestOne = RegExp(/^((https:\/\/)|(www.)|(https:\/\/www.))|tiktok.com(\/\@[\w\d]+)(\/video)(\/[\w\d]+)\?*[\w\d]*/,"g")
                
                // Vm link
                let tiktokTestTwo = RegExp(/^(https:\/\/)?vm.tiktok.com\/([\w\d]+)\??[\w\d]*/,"g")
                
                // Testing for "for you"
                let tiktokTestThree = RegExp(/^((https:\/\/)|(www.)|(https:\/\/www.))|tiktok.com(\/foryou(\?[\w\d]*\=[\w\d]*)?\#?)*(\/\@[\w\d]+)(\/video)(\/[\w\d]+)\?*[\w\d]*/,"g")

                // Is the requested video from Instagram ?
                if (cmd.args[0].indexOf('instagram') !== -1) {
    
                    // Navigate to the download page
                    // and wait till everything is loaded
                    await page.goto(cmd.args[0],{
                        timeout: 0,
                        waitUntil: 'networkidle2'
                    }).catch(async()=>{
                        msg.reply(MSGS.NAV_ERROR)
                        await browser.close()
                        queue.dequeue()
                    })
    
                    // Click video to load media request
                    await page.click('div[class="fXIG0"]').catch(async ()=>{

                        let notice = await msg.channel.send(MSGS.NAV_ERROR)
                        setTimeout(async () => {
                            await notice.delete()
                        }, 2000);

                    })
                }
    
                // Is the requested video from Tiktok ?
                else if (tiktokTestOne.test(cmd.args[0]) || tiktokTestTwo.test(cmd.args[0]) || tiktokTestThree.test(cmd.args[0])) {
                    
                    // Prevent request listener from listening
                    // to media requests for now
                    waitTiktok = true

                    // Whether the video is from the "for you" page
                    let foryou = tiktokTestThree.test(cmd.args[0])
                    let video = cmd.args[0]
    
                    if (foryou) 
                        video = "https://www.tiktok.com/".concat(cmd.args[0].substring(cmd.args[0].indexOf("@")))
                    
                    if (tiktokTestTwo.test(cmd.args[0])){

                        //Navigate to get normal full URL
                        waitTiktok = false
                        
                        await page.goto(cmd.args[0], {timeout:0, waitUntil: 'networkidle2'})
                            .catch(async()=>{
                                msg.reply(MSGS.NAV_ERROR)
                                await browser.close()
                                queue.dequeue()
                            })
                        
                        await page.waitForNavigation({timeout:0, waitUntil: 'networkidle2'})
                            .catch(async()=>{
                                msg.reply(MSGS.NAV_ERROR)
                                await browser.close()
                                queue.dequeue()
                            })
                        
                        video = await page.url()
                    }
                    
                    // Log requested link
                    console.log(cmd.args[0])

                    waitTiktok = false
                    await page.goto(video,{
                        timeout:0,
                        waitUntil: 'networkidle2'
                    })
                }
            }
    
            // Error when the download queue is full
            else {
                queue.enqueue(msg)
                let full = await msg.channel.send(MSGS.REQUEST_FULL)
                setTimeout(async () => {
                    await full.delete()
                }, 2000);
            }
        }
    
    })

    //util functions

    async function * updateStatus(msg) {
        let message = await msg.channel.send(MSGS.REQUEST_ENQUEUED)
        yield await message.edit(MSGS.REQUEST_SEARCHING)
        yield await (async () => { 
            message.edit(MSGS.REQUEST_FOUND)
        })
        yield await message.delete()
    }

}