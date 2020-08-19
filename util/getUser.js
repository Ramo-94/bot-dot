module.exports = (target) => {

    for (const member of target.guild.members.cache.values()) 
        if (member.user.username === target.author.username) 
            return member
}