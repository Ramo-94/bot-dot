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

module.exports = class TaskEnqueuer {

    #activeQueue = []
    #queue = []
    #limit
    #client
    #clientListenerType

    constructor(client, clientListenerType, limit) {
        this.#limit = limit
        this.#client = client
        this.#clientListenerType = clientListenerType
    }

    enqueue(message) {
        if (!this.__isActiveQueueFull())
            this.#activeQueue.unshift(message)
        else
            this.#queue.unshift(message)
    }

    dequeue() {
        this.#activeQueue.pop()
        //Refill active queue
        for (let i = 0; i < this.#queue.length; i++) {
            if (!this.__isActiveQueueFull()) {
                let popped = this.#queue.pop()
                popped.emitted = true
                this.run(popped)
            }
            else break
        }
    }

    run(message) {
        this.#client.emit(this.#clientListenerType, message)
    }

    __isActiveQueueFull() {
        return (this.#activeQueue.length >= this.#limit ? true : false)
    }

    __isActiveQueueEmpty() {
        return (this.#activeQueue.length === 0 ? true : false)
    }

    __isQueueEmpty() {
        return (this.#queue.length === 0 ? true : false)
    }

    isFull() {
        return this.__isActiveQueueFull()
    }
}

