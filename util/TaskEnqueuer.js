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
                this.enqueue(popped)
            }
            else
                break
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

