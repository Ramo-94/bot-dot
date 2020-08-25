const ask = require('../util/ask')
const interp = require('../util/interpretCommand')

const {installMouseHelper} = require('../util/installMouseHelper')
const fs = require('fs')
const bent = require('bent')
const getBuffer = bent('buffer')
const puppeteer = require('puppeteer')
const getUser = require('../util/getUser')
const Discord = require('discord.js')
const { isNullOrUndefined } = require('util')
const { OWNER, APPLINK } = require('../variables')
const { url } = require('inspector')
const { URLSearchParams } = require('url')
const { execSync } = require('child_process')

module.exports = (client) => {

    client.on('message', async (msg) => {
    
        let cmd = interp(msg.content, true)


        if(cmd && cmd.base === "testo"){
            
        }

        //////////////////////////////////
        // MANUAL REMOTE LOG IN COMMAND //
        //////////////////////////////////

        if (cmd && cmd.base === "control" && !msg.author.bot && msg.author.tag === OWNER) {

            //Create a DM channel with the OWNER
            let dm = await msg.author.createDM()

            //Function to update screen
            let printTemp = async () => {
                console.log("Printing")
                await page.screenshot({path: 'temp.png'})
                let tempEmbed = new Discord.MessageEmbed()
                tempEmbed
                    .attachFiles('temp.png')
                    .setImage("attachment://temp.png")
                await dm.send(tempEmbed)
                fs.unlinkSync('temp.png')
            }

            //Function to send page options to author DMs
            let tellOptions = async () => {
                
                await page.evaluate(()=>{
                    let counter = 0
                    let values = new Array(3)
                    for(let i = 0; i<3; i++)
                        values[i] = new Array()                    
                    
                    for (const element of document.getElementsByTagName('input')) {
                        if (!element.id) 
                            element.id = "field" + counter + ""

                        if( (element.type === "text" || element.type === "password")
                                                        && !element.hasAttribute('readOnly')){
                            values[0].push(element.id)
                            counter++
                        }
                        if (element.type==="submit") {
                            values[2].push(element.id)
                            counter++
                        }
                        
                    }
                    for (const element of document.getElementsByTagName('button')) {
                        counter++
                        if (!element.id) 
                            element.id = "button"+counter
                        if (element.type==="submit"){
                            values[2].push(element.id)
                            counter++
                        }
                        else{
                            values[1].push(element.id)
                            counter++}
                        }
                    window.getvalues(values)
                })

                let fieldsMsg = "", buttonsMsg = "", submitMsg = ""
                if (fields.length > 0) {
                    fields.map(e => {
                        fieldsMsg += " "+e
                    })
                }
                if (buttons.length > 0) {
                    buttons.map(e => {
                        buttonsMsg += " "+e
                    })
                }
                if (!isNullOrUndefined(submit)) {
                    submitMsg += submit
                }

                await dm.send(`You have fields: ${fieldsMsg}
                               You have buttons: ${buttonsMsg}
                               You have a submit button: ${submitMsg}
                `)
            }

            const browser = await puppeteer.launch({
                headless: true,
                args:['--no-sandbox']
            
            })
            
            let page = await browser.newPage()

            //A focused mouse for screen navigation
            await installMouseHelper(page)
            let x,y,doc
            let fields = [], buttons = [], submit

            await page.exposeFunction('xy', xy => {
                x = xy[0], y = xy[1], doc = xy[2]
            })

            await page.exposeFunction('getvalues',(values)=>{
                fields  = values[0]
                buttons = values[1]
                submit  = values[2]
            })

            await msg.reply("Beginning remote control")

            //Getting control user input
            let questions = async () => {

                //Ask OWNER what browser command they want
                await ask(client,msg,"What do you want to do?")
                        .then(async answer => {

                            if (answer !== "stop") {

                                switch (answer) {

                                    //If command is goto, then case is valid
                                    case answer.startsWith("goto") ? answer: false:
                                        (async()=>{
                                            
                                            //Get the first argument from the command
                                            let site = answer.split(' ')[1].trim()
                                            
                                            //If the user didn't add http://
                                            //in their destination, add it yourself
                                            if (site.indexOf("http") == -1) 
                                                site = "http://"+site
                                            
                                            await page.goto(site).catch(console.log)
                                            await tellOptions()
                                            await printTemp()

                                        })()
                                        break

                                    //Move the mouse on the selected field
                                    case answer.startsWith("focus") ? answer: false:
                                        (async()=>{
                                            let element = answer.split(' ')[1].trim()
                                            
                                            await page.evaluate(element => {
                                                let values = []
                                                let doc = document.getElementById(element)
                                                let x = doc.getClientRects()[0].x
                                                let y = doc.getClientRects()[0].y
                                                values.push(x); values.push(y); values.push(doc.id)
                                                xy(values)
                                            },element)
                                            await page.mouse.move(x*1.1,y*1.1)
                                            await printTemp()
                                        })()
                                        break

                                    case answer.startsWith("click") ? answer : false:
                                        (async()=>{
                                            await page.click("#"+doc)
                                        })()
                                        break

                                    case answer.startsWith("type") ? answer : false:
                                        (async()=>{
                                            let words = answer.split(' ')[1].trim()
                                            await page.type("#"+doc,words)
                                        })()
                                        break

                                    case "options":
                                        (async()=>{await tellOptions()})()
                                        break

                                    default:
                                        break
                                }

                                //Ask again
                                questions()
                            }
                            else{
                                await browser.close()
                            }
                        })
            }
            questions()
        }

        ///////////////////////////////
        // IF COMMAND IS TO DOWNLOAD //
        ///////////////////////////////

        else if (cmd && cmd.base === "dl" && !msg.author.bot) {

            let waitTiktok = false

            //browser and page setup
            const browser = await puppeteer.launch({headless: true})
            const page = await browser.newPage()
            await page.setViewport({
                width:  1920,
                height: 1080
            })

            //Initial command clean up and response from discord chat
            let reply1 = await msg.channel.send("Searching..")
            await msg.delete()

            //Is the request a media request?
            let reqListen = page.on('request', async request => {

                if (request.resourceType() === 'media' && !waitTiktok) {
                    
                    //Wait for the media URL to load
                    let url
                    await page.waitForResponse(response => response.url() != null)
                        .catch(async err => {
                            console.log("Response wait error: " + err)
                            await msg.reply("Couldn't get the video. Try again or contact dev")
                            browser.close()
                    }).then((res)=>{
                        url = res.url()
                    })

                    //Remove this listener after getting the needed request
                    page.removeListener('request', reqListen)

                    //Remove searching notice
                    await reply1.delete()

                    let reply2 = await msg.reply("Found media request")

                    if (url) {

                        let reply3 = await msg.reply("Will try to download")
        
                        //Get mp4 buffer using bent & Write buffer to local file
                        let buf = await getBuffer(request.response().url())
                        fs.writeFileSync("./video.mp4", buf)
                        
                        // execSync(`ffmpeg -i video.mp4 -vcodec libx264 -crf 38 -y out.mp4`,(err)=>{
                        //     if (err) 
                        //         console.log(`err: ${err}`)
                        // })
                        
                        //Upload the file to discord
                        await msg.channel.send({
                            files: ['./video.mp4']
                        }).catch(async ()=>{
                            console.log("File too large")
                            await msg.channel.send("File too large")
                        })

                        //Remove last notice messages
                        await reply2.delete()
                        await reply3.delete()

                        //Delete local video copy to save space
                        fs.unlinkSync("./video.mp4")
                        // fs.unlinkSync("./out.mp4")


                        await browser.close()
                    }
                }
            })

            //Is the page a login page?
            let reqListen2 = page.on('load', async () => {

                if(page.url().includes("/login/")) {

                    //DM the registered OWNER of the bot that
                    //the bot needs a login to get content
                    let dm = await getUser("OWNER",client)[0].createDM()
                    await dm.send("Instagram requires login, please assume control")

                    //Clear listener after informing owner
                    page.removeListener('load', reqListen2)
                }
            })

            //Navigate to the download page
            //and wait till everything is loaded
            //and the page is idle


            if (cmd.args[0].indexOf('instagram') !== -1) {

                await page.goto(cmd.args[0],{
                    timeout: 0,
                    waitUntil: 'networkidle2'
                   })
                   .catch(async()=>{
       
                       msg.reply("Network error")
                       await browser.close()
                   })

                ((async()=>{

                    //Click video box multiple times
                    //to force the media request to
                    //be sent and intercepted
    
                    await page.mouse.click(700,400)
                    await page.mouse.click(700,400)
                    await page.mouse.click(700,400)
                    await page.mouse.click(700,400)
                }))()
            }

            if (cmd.args[0].indexOf('tiktok') !== -1) {

                await installMouseHelper(page)
                waitTiktok = true

                let fullUrl = cmd.args[0].split('/')
                let foryou = (fullUrl[3].indexOf("foryou") !== -1) ? true : false
                let userPage

                userPage = "https://www.tiktok.com/".concat(fullUrl[3])

                if (foryou) 
                    userPage = "https://www.tiktok.com/".concat(fullUrl[4])
                
                console.log(cmd.args[0])

                await page.goto(userPage,{
                    timeout: 0,
                    waitUntil: 'networkidle2'
                })
                
                let video = cmd.args[0]
                if (cmd.args[0].indexOf('?') !== -1) 
                    video = cmd.args[0].split('?')[0]
                
                if (foryou) 
                    video = userPage + "/video/" + fullUrl[6] 

                let search = () => {return new Promise(async (res)=>{

                    //Is first?
                    await page.exposeFunction('firstHref', async(val)=>{
                        if (cmd.args[0].includes(val)) {
                            waitTiktok = false
                            await page.reload()
                        }
                    })

                    await page.waitForSelector(`div[class~="video-feed"]`).catch( async()=>{
                        let dm = await msg.author.createDM()
                        await dm.send("Could not find the video, try again and check your link")
                        await browser.close()
                    })
                    
                    await page.evaluate(()=>{
                        let ref = document.getElementsByClassName('video-feed')[0].firstChild.querySelectorAll('a')[0].href
                        firstHref(ref)
                    }).catch(async (err) => {
                        console.log(err)
                        await msg.reply("Error, please try again")
                    })

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
                    await scroll().catch(console.log)
                    })
                }
                
                await search().then( async()=>{

                    waitTiktok = false                
                    await page.hover(`a[href="${video}"]`)

                })

            }
        }
    })

}


            // Embed/Screen refresh interval code to print screen in one embed //

            // let counter = 0
            // let printScreen = setInterval(async() => {

            //     await page.screenshot({path:`./public/screenControl${counter}.png`})
            //     .then(async()=>{
            //         await screen.edit(
            //             new Discord.MessageEmbed()
            //             .setImage(`${APPLINK}/?pic=screenControl${counter}`)
            //         )
            //         console.log("updated")
            //     })

            //     counter++

            //     let cleanUp = setInterval(async() => {
            //         if (!printScreen.hasRef())
            //             cleanUp.unref()
            //         if (counter > 0 && fs.existsSync(`./public/screenControl${counter-1}.png`))
            //             fs.unlinkSync(`./public/screenControl${counter-1}.png`)
            //     }, 3000);
            // }, 3000);