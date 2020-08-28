        //////////////////////////////////
        // MANUAL    CONTROL   COMMAND  //
        //////////////////////////////////

        //NOT NEEDED

        // if (cmd && cmd.base === "control" && !msg.author.bot && msg.author.tag === OWNER) {

        //     //Create a DM channel with the OWNER
        //     let dm = await msg.author.createDM()

        //     //Function to update screen
        //     let printTemp = async () => {
        //         console.log("Printing")
        //         await page.screenshot({path: 'temp.png'})
        //         let tempEmbed = new Discord.MessageEmbed()
        //         tempEmbed
        //             .attachFiles('temp.png')
        //             .setImage("attachment://temp.png")
        //         await dm.send(tempEmbed)
        //         fs.unlinkSync('temp.png')
        //     }

        //     //Function to send page options to author DMs
        //     let tellOptions = async () => {
                
        //         await page.evaluate(()=>{
        //             let counter = 0
        //             let values = new Array(3)
        //             for(let i = 0; i<3; i++)
        //                 values[i] = new Array()                    
                    
        //             for (const element of document.getElementsByTagName('input')) {
        //                 if (!element.id) 
        //                     element.id = "field" + counter + ""

        //                 if( (element.type === "text" || element.type === "password")
        //                                                 && !element.hasAttribute('readOnly')){
        //                     values[0].push(element.id)
        //                     counter++
        //                 }
        //                 if (element.type==="submit") {
        //                     values[2].push(element.id)
        //                     counter++
        //                 }
                        
        //             }
        //             for (const element of document.getElementsByTagName('button')) {
        //                 counter++
        //                 if (!element.id) 
        //                     element.id = "button"+counter
        //                 if (element.type==="submit"){
        //                     values[2].push(element.id)
        //                     counter++
        //                 }
        //                 else{
        //                     values[1].push(element.id)
        //                     counter++}
        //                 }
        //             window.getvalues(values)
        //         })

        //         let fieldsMsg = "", buttonsMsg = "", submitMsg = ""
        //         if (fields.length > 0) {
        //             fields.map(e => {
        //                 fieldsMsg += " "+e
        //             })
        //         }
        //         if (buttons.length > 0) {
        //             buttons.map(e => {
        //                 buttonsMsg += " "+e
        //             })
        //         }
        //         if (!isNullOrUndefined(submit)) {
        //             submitMsg += submit
        //         }

        //         await dm.send(`You have fields: ${fieldsMsg}
        //                        You have buttons: ${buttonsMsg}
        //                        You have a submit button: ${submitMsg}
        //         `)
        //     }

        //     const browser = await puppeteer.launch({
        //         headless: true,
        //         args:['--no-sandbox']
            
        //     })
            
        //     let page = await browser.newPage()

        //     //A focused mouse for screen navigation
        //     await installMouseHelper(page)
        //     let x,y,doc
        //     let fields = [], buttons = [], submit

        //     await page.exposeFunction('xy', xy => {
        //         x = xy[0], y = xy[1], doc = xy[2]
        //     })

        //     await page.exposeFunction('getvalues',(values)=>{
        //         fields  = values[0]
        //         buttons = values[1]
        //         submit  = values[2]
        //     })

        //     await msg.reply("Beginning remote control")

        //     //Getting control user input
        //     let questions = async () => {

        //         //Ask OWNER what browser command they want
        //         await ask(client,msg,"What do you want to do?")
        //                 .then(async answer => {

        //                     if (answer !== "stop") {

        //                         switch (answer) {

        //                             //If command is goto, then case is valid
        //                             case answer.startsWith("goto") ? answer: false:
        //                                 (async()=>{
                                            
        //                                     //Get the first argument from the command
        //                                     let site = answer.split(' ')[1].trim()
                                            
        //                                     //If the user didn't add http://
        //                                     //in their destination, add it yourself
        //                                     if (site.indexOf("http") == -1) 
        //                                         site = "http://"+site
                                            
        //                                     await page.goto(site).catch(console.log)
        //                                     await tellOptions()
        //                                     await printTemp()

        //                                 })()
        //                                 break

        //                             //Move the mouse on the selected field
        //                             case answer.startsWith("focus") ? answer: false:
        //                                 (async()=>{
        //                                     let element = answer.split(' ')[1].trim()
                                            
        //                                     await page.evaluate(element => {
        //                                         let values = []
        //                                         let doc = document.getElementById(element)
        //                                         let x = doc.getClientRects()[0].x
        //                                         let y = doc.getClientRects()[0].y
        //                                         values.push(x); values.push(y); values.push(doc.id)
        //                                         xy(values)
        //                                     },element)
        //                                     await page.mouse.move(x*1.1,y*1.1)
        //                                     await printTemp()
        //                                 })()
        //                                 break

        //                             case answer.startsWith("click") ? answer : false:
        //                                 (async()=>{
        //                                     await page.click("#"+doc)
        //                                 })()
        //                                 break

        //                             case answer.startsWith("type") ? answer : false:
        //                                 (async()=>{
        //                                     let words = answer.split(' ')[1].trim()
        //                                     await page.type("#"+doc,words)
        //                                 })()
        //                                 break

        //                             case "options":
        //                                 (async()=>{await tellOptions()})()
        //                                 break

        //                             default:
        //                                 break
        //                         }

        //                         //Ask again
        //                         questions()
        //                     }
        //                     else{
        //                         await browser.close()
        //                     }
        //                 })
        //     }
        //     questions()
        // }