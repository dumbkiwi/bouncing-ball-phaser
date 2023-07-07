interface GameMode {
    getRubrics(): DifficultyManager.Rubrics
}

interface GameModeContext extends GameMode {
    getMode(): GameMode
    changeState(state: GameMode): GameMode
}