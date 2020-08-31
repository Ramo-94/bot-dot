const { AUTH1, AUTH2 } = require('../variables')
const getUser = require('./getUser')

module.exports = (message) => {
    let user = getUser(message)
    for (const role of user.roles.cache.values()) 
        if (role.name == AUTH1 || role.name == AUTH2)
            return true
    return false
    
}