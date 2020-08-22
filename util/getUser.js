const Discord = require('discord.js')


module.exports = (target,client) => {

    //Find user from message object
    if (Object.getPrototypeOf(target) === Discord.Message.prototype) 
        for (const member of target.guild.members.cache.values()) 
            if (member.user.tag === target.author.tag) 
                return member

    //Find user(s) by username
    if (Object.getPrototypeOf(target) === String.prototype) {

        let users = []
        
        if (target === "OWNER") 
            target = process.env.OWNER
        
        //Look for the user in all guilds
        client.guilds.cache.map(guild => {
            guild.members.cache.map(member => {

                //Search by user tag
                if (target.includes('#')) 
                    if (member.user.tag.toLowerCase() === target.toLowerCase())
                        users.push(member.user)
                //Search by username
                else
                    if (member.user.username.toLowerCase() === target.toLowerCase()) 
                        users.push(member.user)
            })
        })

        if (users.length == 0)
            return null
        return users
    }

}