export class StaticState implements GameplayState {
    getPlayerAcceleration(): number {
        return 0
    }

    getPlatformVelocity(): number {
        return 0
    }

    getNextPlatformShadowColor(): number {
        return 0xeeeeee
    }
}

export class PlayingAcceleratedState implements GameplayState {
    private currX: number
    private currY: number
    private payload: PlatformColors

    constructor(payload: PlatformColors) {
        this.currX = 0
        this.currY = 0
        this.payload = payload
    }

    getPlayerAcceleration(): number {
        return 200
    }

    getPlatformVelocity(): number {
        return -650
    }

    getNextPlatformShadowColor(): number {
        const rowLength = this.payload.length
        const colLength = this.payload[this.currX].length

        // if j is not at the end of the column return the next j of the same i
        if (this.currY < colLength - 1) {
            const ret = this.payload[this.currX][this.currY]
            this.currY += 1
            return ret
        }

        // if i is not at the end of the row return the next i of j = 0
        if (this.currX < rowLength - 1) {
            const ret = this.payload[this.currX][this.currY]
            this.currX += 1
            this.currY = 0
            return ret
        }

        // if i is at the end of the row and j is at the end of the column return the first i of j = 0
        this.currX = 0
        this.currY = 0
        return this.payload[0][0]
    }
}

export class PlayingState implements GameplayState {
    getPlayerAcceleration(): number {
        return 200
    }

    getPlatformVelocity(): number {
        return -550
    }

    getNextPlatformShadowColor(): number {
        return 0xeeeeee
    }
}

export class GameOverState implements GameplayState {
    getPlayerAcceleration(): number {
        return 0
    }

    getPlatformVelocity(): number {
        return 0
    }

    getNextPlatformShadowColor(): number {
        return 0xeeeeee
    }
}

export default class GameplayStateMachine implements GameplayContext {
    private state: GameplayState
    private eventListeners: ((state: GameplayState) => void)[]

    constructor(initialState: GameplayState) {
        this.state = initialState
        this.eventListeners = []
    }

    getState(): GameplayState {
        return this.state
    }

    changeState(state: GameplayState): GameplayState {
        this.state = state

        this.eventListeners.forEach((callback) => {
            callback(this.state)
        })

        return state
    }

    getPlayerAcceleration(): number {
        return this.state.getPlayerAcceleration()
    }

    getPlatformVelocity(): number {
        return this.state.getPlatformVelocity()
    }

    getNextPlatformShadowColor(): number {
        return this.state.getNextPlatformShadowColor()
    }

    onStateChange(callback: (state: GameplayState) => void): number {
        return this.eventListeners.push(callback) - 1
    }

    removeEventListener(index: number): void {
        this.eventListeners.splice(index, 1)
    }
}
