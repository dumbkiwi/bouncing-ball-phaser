const MULTIPLIER_THRESHOLD: {
    [key: number]: number
} = {
    0: 1,
    5: 2,
    10: 3,
    15: 4,
    25: 5,
    35: 6,
    45: 7,
    55: 8,
    70: 9,
    85: 10,
}

export default class ScoreManager extends Phaser.GameObjects.Group {
    private score: number
    private highScore: number
    private consecutiveHits: number
    private multiplier: number

    private highScoreText: Phaser.GameObjects.Text
    private scoreText: Phaser.GameObjects.Text
    private multiplierText: Phaser.GameObjects.Text

    private scoreEvent: Phaser.Events.EventEmitter

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, [], {
            runChildUpdate: true,
        })

        scene.add.existing(this)

        const highScore = this.loadScore()

        const highScoreText = scene.add
            .text(x, y, highScore.toString(), {
                fontFamily: 'Arial',
                fontSize: 64,
                fontStyle: 'bold',
                color: '#aaaaaa',
                align: 'center',
            })
            .setOrigin(0.5)

        const score = scene.add
            .text(x, y + 120, '0', {
                fontFamily: 'Arial',
                fontSize: 128,
                fontStyle: 'bold',
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5)

        const multiplier = scene.add
            .text(x, y + 240, 'x1', {
                fontFamily: 'Arial',
                fontSize: 92,
                fontStyle: 'bold',
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5)

        this.add(highScoreText)
        this.add(score)
        this.add(multiplier)

        this.score = 0
        this.highScore = highScore
        this.consecutiveHits = 0
        this.multiplier = 1

        this.highScoreText = highScoreText
        this.scoreText = score
        this.multiplierText = multiplier

        this.scoreEvent = new Phaser.Events.EventEmitter()
    }

    /**
     * Increment the score and apply multiplier if applicable
     * @param isChainable whether the score is chainable
     * @returns the new score
     */
    public tryAddScore(isChainable = false): number {
        if (isChainable) {
            this.tryIncrementMultiplier()
        } else {
            this.resetMultiplier()
        }

        return this.addScore()
    }

    private addScore(): number {
        this.score += 1 * this.multiplier
        this.scoreText.setText(this.score.toString())

        if (this.score > this.highScore) {
            this.highScore = this.score
            this.highScoreText.setText(`${this.highScore}`)
        }

        this.emitScoreChange()

        return this.score
    }

    public resetMultiplier() {
        this.consecutiveHits = 0
        this.multiplier = 1
        this.multiplierText.setText(`x${this.multiplier}`)
    }

    private tryIncrementMultiplier() {
        this.consecutiveHits += 1

        if (this.consecutiveHits in MULTIPLIER_THRESHOLD) {
            this.incrementMultiplier()
        }
    }

    private incrementMultiplier() {
        this.multiplier = MULTIPLIER_THRESHOLD[this.consecutiveHits]
        this.multiplierText.setText(`x${this.multiplier}`)
    }

    public resetScore() {
        this.score = 0
        this.scoreText.setText(`${this.score}`)
    }

    public saveScore() {
        localStorage.setItem('score', this.highScore.toString())
    }

    public loadScore() {
        const item = localStorage.getItem('score')

        if (item) {
            return parseInt(item)
        }

        return 0
    }

    public onScoreChange(callback: (score: number, consecutiveHits: number, multiplier: number) => void) {
        this.scoreEvent.on('scoreChange', callback)
    }

    public offScoreChange(callback: (score: number, consecutiveHits: number, multiplier: number) => void) {
        this.scoreEvent.off('scoreChange', callback)
    }

    private emitScoreChange() {
        this.scoreEvent.emit('scoreChange', this.score, this.consecutiveHits, this.multiplier)
    }

    public getScore() {
        return this.score
    }

    public getHighScore() {
        return this.highScore
    }
}
