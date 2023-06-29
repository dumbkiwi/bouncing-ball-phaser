type PlatformColors = number[][]

interface GameplayState {
    getPlayerAcceleration(): number
    getPlatformVelocity(): number
    getNextPlatformShadowColor(): number
}

interface GameplayContext extends GameplayState {
    getState(): GameplayState
    changeState(state: GameplayState): GameplayState
    onStateChange(callback: (state: GameplayState) => void): number
    removeEventListener(index: number): void
}