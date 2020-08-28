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
                    headless: true,
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
                    await page.click('div[class="fXIG0"]') 
                }
    

                // Is the requested video from Tiktok ?
                else if (cmd.args[0].indexOf('tiktok') !== -1) {
                    
                    // Prevent request listener from listening
                    // to media requests for now
                    waitTiktok = true
    
                    let fullUrl = cmd.args[0].split('/')

                    // Whether the video is from the "for you" page
                    let foryou = (fullUrl[3].indexOf("foryou") !== -1) ? true : false
                    let userPage
    
                    
                    if (foryou) 
                        userPage = "https://www.tiktok.com/".concat(fullUrl[4])
                    else
                        userPage = "https://www.tiktok.com/".concat(fullUrl[3])
                    
                    // Log requested link
                    console.log(cmd.args[0])
    
                    // Navigate to user page to avoid
                    // direct video link load failure.
                    // Probably an anti-scrapping mechanism
                    await page.goto(userPage,{
                        timeout: 0,
                        waitUntil: 'networkidle2'
                    })
                    
                    // Make the direct video link
                    let video = cmd.args[0]
                    if (cmd.args[0].indexOf('?') !== -1) 
                        video = cmd.args[0].split('?')[0]
                    
                    if (foryou) 
                        video = userPage + "/video/" + fullUrl[6]
                    
                    // Look for the video on the user's list
                    let search = () => {return new Promise(async (res)=>{
    
                        // If it's the first video
                        // We expose a function to extract the link
                        // to the video from the local context code evaluated
                        // on the page itself
                        await page.exposeFunction('firstHref', async(val)=>{
                            if (cmd.args[0].includes(val)) {
                                waitTiktok = false
                                await page.reload()
                            }
                        })
    
                        // Wait for the list selector
                        await page.waitForSelector(`div[class~="video-feed-item"]`).then( 
                            async () => {

                                // Find it
                                await page.evaluate(()=>{
                                    let ref = document.getElementsByClassName('video-feed')[0].firstChild.querySelectorAll('a')[0].href
                                    
                                    // Pass it back to the exposed function
                                    firstHref(ref)
                                }).catch(async err => {
                                    console.log("====SELECTOR NOT FOUND. DIDN'T LOAD YET?====")
                                })
                        })
                        
                        // If not found, keep scrolling till you find it
                        let scroll = async () => {
                            
                            await page.evaluate(()=>{
                                window.scrollTo(0,document.body.scrollHeight)
                            })
    
                            await page.$(`a[href="${video}"]`)
                            .then( async(resolve)=>{
                                    if (resolve){
                                        waitTiktok = false
                                        res()
                                    }
                                    else
                                        await scroll()
                            })
                        
                        }
                        await scroll().catch(()=>{}) // Execution context will be destroyed if page navigates
                                                     // so the error is expected
                        })
                    }
                    
                    // Start the search and scroll code
                    await search().then( async()=>{
    
                        waitTiktok = false
                        await page.hover(`a[href="${video}"]`)
    
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