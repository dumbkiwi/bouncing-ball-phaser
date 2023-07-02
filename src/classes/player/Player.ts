import DEFAULT_PLAYER_DATA from '@/constants/playerData'
import Vector2 = Phaser.Math.Vector2
import GameplayStateMachine, { GameOverState } from '../gameplay-state/GameplayState'
import ScoreManager from '../score/ScoreManager'

export default class Player extends Phaser.Physics.Arcade.Image {
    private acceleration: Vector2

    private pointerDown: boolean
    private ignoreInput: boolean

    private scoreManager: ScoreManager
    private gameState: GameplayStateMachine

    private emitter: Phaser.GameObjects.Particles.ParticleEmitter
    private deathEmitterFlow: Phaser.GameObjects.Particles.ParticleEmitter
    private deathEmitterExpl: Phaser.GameObjects.Particles.ParticleEmitter

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        frame: string | number,
        scoreManager: ScoreManager,
        gameState: GameplayStateMachine
    ) {
        super(scene, x, y, texture, frame)
        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.setScale(0.4, 0.4)

        // add touch interaction
        this.scene.add
            .rectangle(
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

        const emitter = this.createEmitter()
        const deathEmitter = this.createDeathEmitterFlow()
        const deathEmitterExpl = this.createDeathEmitterExpl()

        this.pointerDown = false
        this.ignoreInput = false

        this.acceleration = new Vector2(0, 0)
        this.scoreManager = scoreManager
        this.gameState = gameState

        this.preparePlayer()

        this.emitter = emitter
        this.deathEmitterFlow = deathEmitter
        this.deathEmitterExpl = deathEmitterExpl
    }

    private createEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
        return this.scene.add.particles(0, 0, 'square', {
            lifespan: 800,
            speedY: { min: -200, max: 50 },
            speedX: { min: -500, max: -200 },
            scale: { start: 0.1, end: 0 },
            color: [0x333333],
            gravityY: 0,
            accelerationX: -800,
            particleBringToTop: false,
            emitting: false,
        })
    }

    private createDeathEmitterFlow(): Phaser.GameObjects.Particles.ParticleEmitter {
        // flow type
        return this.scene.add.particles(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.height,
            'square',
            {
                lifespan: 3000,
                x: { min: -80, max: 80 },
                speedY: { min: -200, max: 100 },
                speedX: { min: -50, max: 50 },
                scale: { start: 0.1, end: 0 },
                color: [0xee4444],
                gravityY: -300,
                particleBringToTop: false,
                emitting: false,
            }
        )
    }

    private createDeathEmitterExpl(): Phaser.GameObjects.Particles.ParticleEmitter {
        // explosion type
        return this.scene.add.particles(0, 0, 'square', {
            lifespan: 2000,
            x: { min: -80, max: 80 },
            y: { min: -400, max: 0 },
            speedY: { min: -200, max: 200 },
            speedX: { min: -500, max: 500 },
            accelerationX: { min: -200, max: 200 },
            scale: { start: 0.1, end: 0 },
            color: [0xee4444],
            gravityY: -200,
            particleBringToTop: false,
            emitting: false,
        })
    }

    private preparePlayer() {
        this.setBounce(0)
        this.setCollideWorldBounds(true)
        this.setImmovable(true)

        this.scene.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
            if (body.gameObject === this) {
                this.applyGameOver()
            }
        })

        this.onStateChange(this.gameState.getState())

        const body = this.body as Phaser.Physics.Arcade.Body

        if (!body) {
            throw new Error('Ball body is null')
        }

        body.setAllowGravity(false)
        body.onWorldBounds = true
    }

    private onStateChange(state: GameplayState) {
        this.acceleration.set(0, state.getPlayerAcceleration())
    }

    preUpdate() {
        if (!this.ignoreInput && this.pointerDown) {
            this.body?.velocity.add(this.acceleration)
        }
    }

    public applyGameOver(): void {
        this.gameState.changeState(new GameOverState())

        this.emitDeathParticles()

        const body = this.body as Phaser.Physics.Arcade.Body

        if (!body) {
            throw new Error('Ball body is null')
        }

        body.setAllowGravity(false)
        body.setVelocity(0, 0)
        body.setAcceleration(0, 0)

        this.disableBody(false, false)

        this.scene.tweens.add({
            targets: this,
            duration: 100,
            alpha: 0,
        })
    }

    private emitDeathParticles(): void {
        this.deathEmitterFlow.start()
        this.deathEmitterExpl.emitParticleAt(this.x, this.y + this.height, 100)
    }

    public emitParticles(): void {
        this.emitter.emitParticleAt(this.x, this.y + this.height / 1.3, Math.random() * 10)
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

    public savePlayer() {
        const savedPlayer = Player.loadPlayer()

        const playerData: PlayerData = {
            ...savedPlayer,
            coins: this.scoreManager.getCoin(),
            highScore: this.scoreManager.getHighScore(),
        }

        localStorage.setItem('player', JSON.stringify(playerData))
    }

    public static loadPlayer(): PlayerData {
        const data = localStorage.getItem('player')
        
        if (data) {
            const parsedData = JSON.parse(data)

            if (parsedData satisfies PlayerData) {
                return {
                    ...DEFAULT_PLAYER_DATA,
                    ...parsedData,
                }
            }
        }       

        return DEFAULT_PLAYER_DATA
    }
}
