export default class DifficultyManager {
    private rubrics: DifficultyManager.Rubrics
    private scoreArray: number[]
    private rubricsIndex: number
    private currentPlatformConfig: PlatformSpawnerConfig

    constructor(rubrics: DifficultyManager.Rubrics) {
        this.rubrics = rubrics

        this.scoreArray = Object.keys(this.rubrics)
            .map((key) => {
                return parseInt(key)
            })
            .sort((a, b) => a - b)

        this.rubricsIndex = 0
        this.currentPlatformConfig = rubrics[0]
    }

    /**
     * Returns the platform config for the current score
     * @param score the current score
     * @returns the platform config for the current score
     */
    public updatePlatformConfig(score: number): PlatformSpawnerConfig {
        const nextIndex = this.rubricsIndex + 1
        if (nextIndex < this.scoreArray.length) {
            if (score >= this.scoreArray[nextIndex]) {
                this.rubricsIndex = nextIndex
            }
        }

        this.currentPlatformConfig = {
            ...this.currentPlatformConfig,
            ...this.rubrics[this.scoreArray[this.rubricsIndex]]
        }

        return this.currentPlatformConfig
    }
}
