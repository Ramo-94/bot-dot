module.exports = (user) => {

    for (const role of user.roles.cache.values()) 
        if (role.name == "moderator" || role.name == "admin")
            return true
    return false
    
}