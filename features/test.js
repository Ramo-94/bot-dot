const proxylist = require("proxylist")

module.exports = async (client, msg, cmd) => {
    if (cmd && cmd.base === "test") {
        
        proxylist.main().then(console.log) //=> ["145.34.32.156:4440", ...]
        proxylist.first().then(console.log)
        proxylist.second().then(console.log)
    }
}