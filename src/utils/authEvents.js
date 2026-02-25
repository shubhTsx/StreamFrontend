// Simple event emitter for auth state changes
class AuthEventEmitter {
    constructor() {
        this.listeners = new Set()
    }

    subscribe(callback) {
        this.listeners.add(callback)
        return () => this.listeners.delete(callback)
    }

    emit(data) {
        this.listeners.forEach(callback => callback(data))
    }
}

export const authEvents = new AuthEventEmitter()








