module.exports = (client) => {

    client.on('guildMemberAdd', (info)=>{
        if (info.guild.name === "Dot" && !info.user.bot) {
            info.roles.add("exile")
            info.guild.channels.cache.map((c)=>{
                if (c.name === "exile") {
                    new Discord.TextChannel(info.guild,{id:c.id}).send("For anti-raid you've been automatically exiled till you're approved")
                }
            })
        }
    })

}