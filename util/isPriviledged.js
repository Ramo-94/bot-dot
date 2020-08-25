const { AUTH1, AUTH2 } = require('../variables')

module.exports = (user) => {

    for (const role of user.roles.cache.values()) 
        if (role.name == AUTH1 || role.name == AUTH2)
            return true
    return false
    
}