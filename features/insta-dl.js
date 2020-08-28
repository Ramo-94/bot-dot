const ask = require('../util/ask')
const interpret = require('../util/interpretCommand')

const {installMouseHelper} = require('../util/installMouseHelper')
const fs = require('fs')
const bent = require('bent')
const getBuffer = bent('buffer')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const getUser = require('../util/getUser')
const Discord = require('discord.js')
const { isNullOrUndefined } = require('util')
const { OWNER, APPLINK } = require('../variables')
const { execSync } = require('child_process')
const enqueuer = require('../util/TaskEnqueuer')

module.exports = (client) => {

    let queue = new enqueuer(client, "message", 3)

    client.on('message', async (msg) => {
        
        let reply1
        let cmd = interpret(msg.content, true)
 
        puppeteer.use(StealthPlugin())

        if (cmd && cmd.base === "testo" && !msg.author.bot) {
            // let m = new Discord.Message()
            msg.content = "yasta dl https://www.tiktok.com/@longwatermelon/video/6855920536732601606?lang=en"
            client.emit("message", msg)
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

        else if (cmd && cmd.base === "dl" && !msg.author.bot && !queue.isFull()) {

            reply1 = await msg.channel.send("Request enqueued")
            if (!msg.emitted)
                queue.enqueue(msg)

            let downloadEmbed = new Discord.MessageEmbed()
            .setTitle("Click to go to requested video link")
            .setAuthor("By " + msg.author.username, msg.author.avatarURL())
            .setURL(cmd.args[0])
            .setColor(getUser(msg,client).displayColor)
            

            let authorDM = await msg.author.createDM()

            let waitTiktok = false

            //browser and page setup
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

            //Initial command clean up and response from discord chat
            await reply1.edit("Searching..")
            await msg.delete()

            //Is the request a media request?
            let reqListen = page.on('request', async request => {

                if (request.resourceType() === 'media' && request.method() == "GET" && !waitTiktok) {

                    let url = request.url()

                    //Remove this listener after getting the needed request
                    page.removeListener('request', reqListen)

                    if (url) {

                        //Update searching notice

                        await reply1.edit("Found. Will try to download")
        
                        //Get mp4 buffer using bent & Write buffer to local file
                        let buf = await getBuffer(url)

                        //Calculate file size to determine whether to write to file
                        let size = (buf.byteLength / 1e+6).toFixed(2)

                        console.log("SIZE: "+ size)
                        
                        if (size < 30) 
                            fs.writeFileSync("./video.mp4", buf)
                        
                        //Determine if compression is necessary
                        if (size > 8) {
                            await msg.channel.send("File too large, will try compression")

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
                            await authorDM.send("File too large")
                            queue.dequeue()
                        })

                        //Remove last notice message
                        await reply1.delete()

                        //Delete local video copy to save space
                        if (fs.existsSync("./video.mp4")) 
                            fs.unlinkSync("./video.mp4")

                        await browser.close()
                        queue.dequeue()
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

            await installMouseHelper(page)

            if (cmd.args[0].indexOf('instagram') !== -1) {

                await page.goto(cmd.args[0],{
                    timeout: 0,
                    waitUntil: 'networkidle2'
                }).catch(async()=>{
                    msg.reply("Network error")
                    await browser.close()
                    queue.dequeue()
                })

                await page.click('div[class="fXIG0"]') 

            }

            if (cmd.args[0].indexOf('tiktok') !== -1) {

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

                    await page.waitForSelector(`div[class~="video-feed-item"]`).then( 
                        async () => {
                            await page.evaluate(()=>{
                                let ref = document.getElementsByClassName('video-feed')[0].firstChild.querySelectorAll('a')[0].href
                                firstHref(ref)
                            }).catch(async err => {
                                console.log("====SELECTOR NOT FOUND. DIDN'T LOAD YET?====")
                            })
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
                    await scroll().catch(()=>{}) //Execution context will be destroyed if page navigates
                    })
                }
                
                await search().then( async()=>{

                    waitTiktok = false
                    await page.hover(`a[href="${video}"]`)

                })

            }
        }

        else if (cmd && cmd.base === "dl" && !msg.author.bot && queue.isFull()) {
            queue.enqueue(msg)
            let full = await msg.channel.send("Queue full, please wait")
            setTimeout(async () => {
                await full.delete()
            }, 2000);
        }
            
    })

}