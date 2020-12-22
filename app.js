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

const Discord = require('discord.js')
const client = new Discord.Client()
const { TOKEN } = require('./variables')
const interpret = require('./util/interpretCommand')

// Main features
const features = [
  require('./features/blockBotCommand'),
  require('./features/downloader/dl'),
  require('./features/help'),
  require('./features/ping')
]

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

// Main listeners
client.on('message', async msg => {
  let cmd = interpret(msg)
  features.forEach(async feature => await feature(client, msg, cmd))
  return true
})

// Secondary listeners
function startListeners() {
  let antiRaid = require('./features/antiRaid')(client)
} startListeners()

client.login(TOKEN)
