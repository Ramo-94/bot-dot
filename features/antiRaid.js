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

module.exports = (client) => {

    client.on('guildMemberAdd', (info)=>{
        if (info.guild.name === "Dot" && !info.user.bot) {
            info.roles.add("exile")
            info.guild.channels.cache.map((c)=>{
                if (c.name === "exile") {
                    new Discord.TextChannel(info.guild,{id:c.id}).send("For anti-raid you've been automatically exiled till you're approved")
                }
            })
        }
    })

}