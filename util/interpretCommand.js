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

const { PREFIX } = require('../variables')

module.exports   = (msg) => {

    let command = msg.content

    if (command.length <= 0) 
        return false

    let sections = command.trim().split(' ')
    let base     = ""
    let args     = []

    if (sections[0] !== PREFIX)
        return false
    
    base = sections[1]

    if (sections.length > 2)
        for (let i = 2; i < sections.length; i++) 
            args.push(sections[i])

    return {base, args}

}