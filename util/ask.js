const { OWNER } = require('../variables')

module.exports = async (client,message,question) => {

    let dm = await message.author.createDM()
    await dm.send(question)
    let asked = true

    return new Promise((res, rej)=>{

            client.on('message', answerListener = (msg) => {
                if (msg.channel.type === "dm" && msg.author.tag === OWNER && asked)
                    res(msg.content)
            })
            //Wait 15 minutes for a response
            let noResponse = setTimeout(() => {
                rej("Got no response")
            }, 900000);               
    })

}