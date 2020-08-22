module.exports = async (client,question) => {

    let dm = await msg.author.createDM()
    await dm.send(question)
    let asked = true

    return new Promise((res, rej)=>{
            client.on('message', msg => {
                if (msg.channel.type === "dm" && msg.author.username === "Omar" && asked)
                    res(msg.content)
            })
            //Wait 3 minutes for a response
            setTimeout(() => {
                rej("Got no response")
            }, 900000);               
    })

}