const { prefix } = require('../settings')

module.exports   = (command, argsAllowed) => {

    if (command.length <= 0) 
        return false
    
    let sections = command.trim().split(' ')
    let base     = ""
    let args     = []

    if (sections[0] !== prefix)
        return false
    
    base = sections[1] 

    if (argsAllowed && sections.length > 2)
        for (let i = 2; i < sections.length; i++) 
            args.push(sections[i])


    if (!argsAllowed)
        return { base}
    else
        return { base, args }
    
}