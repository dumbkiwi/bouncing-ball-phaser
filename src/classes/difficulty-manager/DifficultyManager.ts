export default class DifficultyManager {
    private rubrics: DifficultyRubrics
    private scoreArray: number[]
    private rubricsIndex: number

    constructor(rubrics: DifficultyRubrics) {
        this.rubrics = rubrics

        this.scoreArray = Object.keys(this.rubrics).map((key) => {
            return parseInt(key)
        }).sort((a, b) => (a - b))

        this.rubricsIndex = 0
    }

    /**
     * Returns the platform config for the current score
     * @param score the current score
     * @returns the platform config for the current score
     */
    public getPlatformConfig(score: number): PlatformSpawnerConfig {
        const nextIndex = this.rubricsIndex + 1
        if (nextIndex < this.scoreArray.length) {
            if (score >= this.scoreArray[nextIndex]) {
                this.rubricsIndex = nextIndex
            }
        }

        return this.rubrics[this.scoreArray[this.rubricsIndex]]
    }
}