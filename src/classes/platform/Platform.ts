import Phaser from 'phaser'

import Vector2 = Phaser.Math.Vector2
import Player from '../player/Player'
import PlatformCondiment from './PlatformCondiment'

const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
    width: 20,
    height: 10,
    extraWidth: 10,
    platformColor: {
        baseColor: 0x666666,
        accurateColor: 0x88ff88,
        inaccurateColor: 0xffff00,
    },
}

export default class Platform extends Phaser.Physics.Arcade.Sprite {
    private platformConfig: PlatformConfig
    private shadowColor: number
    private requiredAcc: number
    private condiments: PlatformCondiment[]

    private mPlatform: PlatformOverlayConfig
    private lPlatform: PlatformOverlayConfig
    private rPlatform: PlatformOverlayConfig

    private graphics: Phaser.GameObjects.Graphics
    private mainCamera: Phaser.Cameras.Scene2D.Camera

    private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame)
        this.platformConfig = DEFAULT_PLATFORM_CONFIG
        this.requiredAcc = 1
        this.condiments = []

        this.mPlatform = {
            position: new Vector2(),
            size: new Vector2(),
            color: 0xffffff,
            alpha: 1,
        }

        this.lPlatform = {
            position: new Vector2(),
            size: new Vector2(),
            color: 0xffffff,
            alpha: 1,
        }

        this.rPlatform = {
            position: new Vector2(),
            size: new Vector2(),
            color: 0xffffff,
            alpha: 1,
        }

        this.graphics = scene.add.graphics()
        this.mainCamera = scene.cameras.main
        this.shadowColor = 0x000000

        this.setAlpha(0)

        this.particleEmitter = scene.add.particles(0, 0, 'square', {
            lifespan: 600,
            x: { min: -20, max: 20 },
            speedY: { min: -100, max: 600 },
            speedX: { min: -700, max: 200 },
            scale: { start: 0.15, end: 0 },
            color: [0x666666],
            accelerationX: -800,
            accelerationY: 1000,
            particleBringToTop: false,
            emitting: false,
        })
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta)
        if (this.platformConfig) {
            // update graphic position
            this.updateOverlayConfig()

            // draw shadow
            this.drawShadow()

            // draw platform
            this.drawPlatform()
        }
    }

    private drawPlatform(): void {
        this.graphics.setBlendMode(Phaser.BlendModes.MULTIPLY)
        this.drawOverlay(this.lPlatform)
        this.drawOverlay(this.mPlatform)
        this.drawOverlay(this.rPlatform)
    }

    private resetOverlayColors(color = 0x000000) {
        this.mPlatform.color = color
        this.lPlatform.color = color
        this.rPlatform.color = color
    }

    /**
     * Set the platform configuration
     * @param platformConfig The new platform configuration
     * @param requiredAcc The required accuracy to land on the platform
     */
    public resetConfig(requiredAcc: number, platformConfig: PlatformConfig): void {
        const colliderSizeOffsetY = 30

        this.setDisplaySize(platformConfig.width, platformConfig.height + colliderSizeOffsetY)

        this.setOffset(0, colliderSizeOffsetY / 3)

        this.resetOverlayColors(platformConfig.platformColor.baseColor)

        this.condiments = []

        this.platformConfig = platformConfig
        this.requiredAcc = requiredAcc
    }

    private drawOverlay(config: PlatformOverlayConfig): void {
        this.graphics.fillStyle(config.color, config.alpha)
        this.graphics.fillRect(
            config.position.x - config.size.x / 2,
            config.position.y - config.size.y / 2,
            config.size.x,
            config.size.y
        )
    }

    private drawShadow(): void {
        const heightFromBottom = this.mainCamera.height - this.mPlatform.position.y

        // draw gradient shadow
        this.graphics.clear()
        this.graphics.setDepth(this.depth + 1)
        this.graphics.fillGradientStyle(
            this.shadowColor,
            this.shadowColor,
            0xffffff,
            0xffffff,
            0.8,
            0.8,
            0,
            0
        )
        this.graphics.fillRect(
            this.lPlatform.position.x - this.lPlatform.size.x / 2,
            this.mPlatform.position.y + this.mPlatform.size.y / 2,
            this.platformConfig.width,
            heightFromBottom
        )
    }

    private updateOverlayConfig() {
        const x = this.x
        const y = this.y
        const mainWidth = this.requiredAcc * this.platformConfig.width
        const extraWidth = (this.platformConfig.width - mainWidth) / 2
        const extentOffset = mainWidth / 2 + extraWidth / 2

        this.mPlatform.position.set(x, y)
        this.mPlatform.size.set(mainWidth, this.platformConfig.height)

        this.lPlatform.position.set(x - extentOffset, y)
        this.lPlatform.size.set(extraWidth, this.platformConfig.height)

        this.rPlatform.position.set(x + extentOffset, y)
        this.rPlatform.size.set(extraWidth, this.platformConfig.height)
    }

    private setAccurate(): void {
        this.mPlatform.color = this.platformConfig.platformColor.accurateColor
    }

    private setInaccurate(isLeft: boolean): void {
        if (isLeft) {
            this.lPlatform.color = this.platformConfig.platformColor.inaccurateColor
        } else {
            this.rPlatform.color = this.platformConfig.platformColor.inaccurateColor
        }
    }

    /**
     * @returns the platform configuration
     */
    public getConfig(): PlatformConfig | undefined {
        return this.platformConfig
    }

    public getCollisionType(
        player: Player,
        _accuracy: number
    ): {
        isAccurate: boolean
        isLeft: boolean
    } {
        const playerX = player.getCenter().x ?? 0

        const platformExtentL = this.mPlatform.position.x - this.mPlatform.size.x / 2
        const platformExtentR = this.mPlatform.position.x + this.mPlatform.size.x / 2

        const isInaccurate = playerX < platformExtentL || playerX > platformExtentR

        const isLeft = playerX < platformExtentL

        return {
            isAccurate: !isInaccurate,
            isLeft: isLeft,
        }
    }

    /**
     *
     * @param player the player object
     * @param accuracy the accuracy of the player's input
     * @returns how the player landed on the platform
     */
    public applyCollision(
        player: Player,
        accuracy: number
    ): {
        isAccurate: boolean
        isLeft: boolean
    } {
        if (!this.platformConfig) {
            throw new Error('platformConfig is undefined')
        }

        this.requiredAcc = accuracy

        const { isAccurate, isLeft } = this.getCollisionType(player, accuracy)

        // change platform color
        if (isAccurate) {
            this.setAccurate()

            // emit particles
            this.particleEmitter.emitParticleAt(
                this.mPlatform.position.x,
                this.mPlatform.position.y,
                Math.random() * 10 + 10
            )
        } else {
            this.setInaccurate(isLeft)

            // emit particles
            if (isLeft) {
                this.particleEmitter.emitParticleAt(
                    this.lPlatform.position.x,
                    this.lPlatform.position.y,
                    Math.random() * 10
                )
            } else {
                this.particleEmitter.emitParticleAt(
                    this.rPlatform.position.x,
                    this.rPlatform.position.y,
                    Math.random() * 10
                )
            }
        }

        this.setVelocityY(400)

        // propogate to condiments
        this.condiments.forEach((condiment) => {
            // debugger
            condiment.onCollisionWithPlayer(player, isAccurate, isLeft)
        })

        return {
            isAccurate,
            isLeft,
        }
    }

    /**
     * Set the shadow color
     * @param color the new shadow color
     */
    public setShadowColor(color: number): void {
        this.shadowColor = color
    }

    public addCondiment(condiment: PlatformCondiment): void {
        this.condiments.push(condiment)
    }

    public getCondiments(): PlatformCondiment[] {
        return this.condiments
    }

    public clearCondiments(): void {
        this.condiments.forEach((condiment) => {
            condiment.disableBody(true, true)
        })
        this.condiments = []
    }
}
