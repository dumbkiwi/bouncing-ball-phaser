import Vector2 = Phaser.Math.Vector2
import GameplayStateMachine from '../gameplay-state/GameplayState'
import ScoreManager from '../score/ScoreManager'

export default class Player extends Phaser.Physics.Arcade.Image {
    private acceleration: Vector2

    private pointerDown = false
    private ignoreInput = false

    private scoreManager: ScoreManager
    private gameState: GameplayStateMachine

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        scoreManager: ScoreManager,
        gameState: GameplayStateMachine,
    ) {
        super(scene, x, y, texture)
        scene.add.existing(this)
        scene.physics.add.existing(this)

        // add touch interaction
        this.scene.add.rectangle(
            0,
            0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xff0000,
            0
        )
            .setOrigin(0, 0)
            .setInteractive()
            .on('pointerdown', () => {
                this.pointerDown = true

                const body = this.body as Phaser.Physics.Arcade.Body

                if (!body) {
                    throw new Error('Ball body is null')
                }

                if (!body.allowGravity) {
                    body.setAllowGravity(true)
                }
            })

        gameState.onStateChange((state) => {
            this.onStateChange(state)
        })

        this.acceleration = new Vector2(0, 0)
        this.scoreManager = scoreManager
        this.gameState = gameState
        
        this.preparePlayer()
    }

    private preparePlayer() {
        this.setBounce(0)
        this.setCollideWorldBounds(true)
        this.setImmovable(true)


        this.onStateChange(this.gameState.getState())

        const body = this.body as Phaser.Physics.Arcade.Body

        if (!body) {
            throw new Error('Ball body is null')
        }

        body.setAllowGravity(false)
    }

    private onStateChange(state: GameplayState) {
        

        this.acceleration.set(0, state.getPlayerAcceleration())
    }

    preUpdate() {
        if (!this.ignoreInput && this.pointerDown) {
            this.body?.velocity.add(this.acceleration)
        }
    }

    public setIgnoreInput(ignore = true): void {
        this.ignoreInput = ignore

        if (ignore) {
            this.pointerDown = false
        }
    }

    public getScoreManager() {
        return this.scoreManager
    }
}
