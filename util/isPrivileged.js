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

// Define two roles that denote privilege
const { AUTH1, AUTH2 } = require('../variables')
const getUser = require('./getUser')

module.exports = (message) => {
    let user = getUser(message)
    for (const role of user.roles.cache.values()) 
        if (role.name == AUTH1 || role.name == AUTH2)
            return true
    return false
    
}