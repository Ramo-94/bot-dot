// =================================================================
// Copyright [2020] [Omar Ibrahim]

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// =================================================================

const tempMsg = require('../../util/tempMsg')
const MSGS = require('../../messages')
const { GOOGLE_CHROME_SHIM } = require('../../variables')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const fs = require('fs')
const { execSync } = require('child_process')

module.exports = class Browser {
    #proxylist = []
    #settings = { executablePath: GOOGLE_CHROME_SHIM, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
    #counter = 0
    #msg = {}
    #callback
    #proxy
    #page
    #browser

    constructor(retry, headless, proxylist, msg) {
        //Type check and guarantee
        this.#proxylist = Array.isArray(proxylist) && proxylist.length > 0 ? proxylist : []
        this.retry = retry == true ? true : false
        this.headless = headless == true ? true : false
        this.#msg = msg
    }

    get = async (link) => {
        this.link = typeof link === "string" ? link : undefined
        this.#apply()
        this.#browser = await puppeteer.launch(this.#settings).catch(this.#handler)
        this.#page = await this.#browser.newPage()
        this.#listen()
        await this.#page.goto(this.link, { timeout: 0, waitUntil: "networkidle2" }).catch(this.#handler)
    }

    onDownloaded = (func) => {
        this.#callback = func
    }

    #apply = () => {
        this.#settings.headless = this.headless
        if (this.#proxylist.length > 0) {
            let rand = Math.floor(Math.random() * this.#proxylist.length)
            this.#proxy = this.#proxylist[rand]
            this.#settings.args.push(`--proxy-server=http://${this.#proxy}`)
        }
    }

    #log = (error) => {
        console.log("================")
        console.log("ERROR on Browser")
        if (this.#proxy) console.log("Proxy: ", this.#proxy)
        console.log("Page: ", this.#page.url())
        console.log("Message: ", error.message)
        console.log("================")
    }

    #handler = async (error) => {
        let message = error.message
        let messages =
            [
                "Navigation failed because browser has disconnected!",
                // Resource too big
                "Protocol error (Network.getResponseBody): Request content was evicted from inspector cache"
            ]

        if (messages.includes(message)) {
            console.log("Critical error")
            this.#log(error)
            await this.close()

            if (message === messages[1])
                tempMsg(MSGS.COMPRESSION_LARGE, 5000, this.#msg)
            else
                tempMsg(MSGS.NAV_ERROR, 5000, this.#msg)

        } else {

            if (this.retry && this.#counter < 3) {
                this.#log(error)
                console.log("Retrying", this.#counter)
                await this.close()
                this.#counter++
                await this.get(this.link)
            } else {
                this.#log(error)
                await this.close()
            }

        }
    }

    #listen = () => {
        let req
        this.#page.on('request', async request => {
            if (request.resourceType() === 'media' && request.method() == "GET")
                req = request.url()
        })

        this.#page.on('response', async response => {

            if (response.url() === req) {

                let buf = await response.buffer().catch(this.#handler)

                try {

                    let size = (buf.byteLength / 1e+6).toFixed(2) // size in MB
                    console.log("size: ", size)
                    fs.writeFileSync("./video.mp4", buf)

                    //Determine if compression is necessary
                    if (size > 8 && size < 25) {
                        tempMsg(MSGS.NEEDS_COMPRESSION, 2000, this.#msg)
                        await this.#compress()
                    }

                    this.#callback()

                } catch (error) { console.log("closing") }

            }
        })
    }

    close = async () => {
        await this.#page.removeAllListeners()
        let pages = await this.#browser.pages().catch(() => { })
        await Promise.all(pages.map(page => page.close().catch(() => { })))
        await this.#browser.close().catch(() => { })
    }

    #compress = async () => {

        fs.copyFileSync("./video.mp4", "./copyEdit.mp4")
        execSync(`ffmpeg -i ./copyEdit.mp4 -vcodec libx264 -crf 32 -y ./video.mp4`, async err => {
            if (err) {
                this.#handler(err)
                tempMsg(MSGS.COMPRESSION_ERROR, 2000, this.#msg)
                await this.close()
                queue.dequeue()
            }
        })

        // Recalculate size after compression
        let size = (fs.statSync("./video.mp4")["size"] / 1e+6).toFixed(2)
        if (size > 8) {
            tempMsg(MSGS.COMPRESSION_LARGE, 2000, this.#msg)
            await this.close()
        }
    }

    cleanup = () => {
        // If the video exists, remove it
        if (fs.existsSync("./video.mp4")) fs.unlinkSync("./video.mp4")
    }
}