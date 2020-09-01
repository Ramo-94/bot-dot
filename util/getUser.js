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
const { OWNER } = require('../variables')

module.exports = (target,client) => {

    //Find user from message object
    if (Object.getPrototypeOf(target) === Discord.Message.prototype) 
        for (const member of target.guild.members.cache.values()) 
            if (member.user.tag === target.author.tag) 
                return member

    //Find user(s) by username
    if (Object.getPrototypeOf(target) === String.prototype) {

        let users = []
        
        if (target === "OWNER") 
            target = OWNER
        
        //Look for the user in all guilds
        client.guilds.cache.map(guild => {
            guild.members.cache.map(member => {

                //Search by user tag
                if (target.includes('#')) 
                    if (member.user.tag.toLowerCase() === target.toLowerCase())
                        users.push(member.user)
                //Search by username
                else
                    if (member.user.username.toLowerCase() === target.toLowerCase()) 
                        users.push(member.user)
            })
        })

        if (users.length == 0)
            return null
        return users
    }

}