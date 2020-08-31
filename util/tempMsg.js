module.exports = async (message, time, messageObject) => {

    let notice = await messageObject.channel.send(message)
    setTimeout(async () => { await notice.delete() }, time);
    
}