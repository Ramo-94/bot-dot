const proxylist = require("proxylist")

module.exports = async () => {
    let proxies = await proxylist.main()
    return proxies.filter(v => v.split(':')[1] === '80')
}