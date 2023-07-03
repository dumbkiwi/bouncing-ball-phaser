import MULTIPLIER_THRESHOLD from '@/constants/multiplier'
import { getPlayerData } from '../player/PlayerContext'
import { playScore, playScoreChain } from '../sound-manager/SoundManager'

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

        const player = getPlayerData(scene)

        this.score = 0
        this.highScore = player.highScore
        this.consecutiveHits = 0
        this.multiplier = 1

        this.scoreEvent = new Phaser.Events.EventEmitter()

        this.highScoreText = scene.add
            .text(x, y, this.highScore.toString(), {
                fontFamily: 'Arial',
                fontSize: 64,
                fontStyle: 'bold',
                color: '#aaaaaa',
                align: 'center',
            })
            .setOrigin(0.5)

        this.scoreText = scene.add
            .text(x, y + 120, this.score.toString(), {
                fontFamily: 'Arial',
                fontSize: 128,
                fontStyle: 'bold',
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5)

        this.multiplierText = scene.add
            .text(x, y + 240, `x${this.multiplier.toString()}`, {
                fontFamily: 'Arial',
                fontSize: 92,
                fontStyle: 'bold',
                color: '#888888',
                align: 'center',
            })
            .setOrigin(0.5)

        this.add(this.highScoreText)
        this.add(this.scoreText)
        this.add(this.multiplierText)
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

    private emitScoreChange() {
        this.scoreEvent.emit('scoreChange', this.score, this.consecutiveHits, this.multiplier)
    }

    /**
     * Increment the score and apply multiplier if applicable
     * @param isChainable whether the score is chainable
     * @returns the new score
     */
    public tryAddScore(isChainable = false): number {
        if (isChainable) {
            // play audio
            playScoreChain(this.scene, this.consecutiveHits)

            this.tryIncrementMultiplier()
        } else {
            // play audio
            playScore(this.scene)

            this.resetMultiplier()
        }

        return this.addScore()
    }

    /**
     * Reset the multiplier
     */
    public resetMultiplier() {
        this.consecutiveHits = 0
        this.multiplier = 1
        this.multiplierText.setText(`x${this.multiplier}`)
    }

    /**
     * Subscribe to score change
     */
    public onScoreChange(
        callback: (score: number, consecutiveHits: number, multiplier: number) => void
    ) {
        this.scoreEvent.on('scoreChange', callback)
    }

    /**
     * Unsubscribe to score change
     */
    public offScoreChange(
        callback: (score: number, consecutiveHits: number, multiplier: number) => void
    ) {
        this.scoreEvent.off('scoreChange', callback)
    }

    /**
     * Get the current score
     */
    public getScore() {
        return this.score
    }

    /**
     * Get the current high score
     */
    public getHighScore() {
        return this.highScore
    }
}
