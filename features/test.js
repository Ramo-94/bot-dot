const proxylist = require("proxylist")

module.exports = async (client, msg, cmd) => {
    if (cmd && cmd.base === "test") {
        proxylist.main().then(list => {
            console.log("list", list)
            console.log("list one", list[0])
        })
    }
}