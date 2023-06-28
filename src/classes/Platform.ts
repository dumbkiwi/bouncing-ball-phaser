import Phaser from 'phaser'
import Ball from './Ball'

import Vector2 = Phaser.Math.Vector2

const BOUNCE_VELOCITY = 800

type PlatformOverlayConfig = {
    position: Vector2
    size: Vector2
    color: number
    alpha: number
}

export default class Platform extends Phaser.Physics.Arcade.Sprite {
    private platformConfig: PlatformConfig | undefined

    private mPlatform: PlatformOverlayConfig
    private lPlatform: PlatformOverlayConfig
    private rPlatform: PlatformOverlayConfig

    private requiredAccuracy: number | undefined

    private player: Ball | undefined
    private graphics: Phaser.GameObjects.Graphics
    private mainCamera: Phaser.Cameras.Scene2D.Camera

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame)
        this.platformConfig = undefined

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

        this.requiredAccuracy = undefined

        this.player = undefined
        this.graphics = scene.add.graphics()
        this.mainCamera = scene.cameras.main
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta)

        if (this.platformConfig) {
            // update graphic position
            this.updateGraphicPosition(this.platformConfig)

            // draw shadow
            this.drawShadow(this.platformConfig)

            // draw platform overlays
            this.graphics.setBlendMode(Phaser.BlendModes.MULTIPLY)
            this.drawOverlay(this.lPlatform)
            this.drawOverlay(this.mPlatform)
            this.drawOverlay(this.rPlatform)
        }
    }

    /**
     * Reset the platform to its initial state
     * @param x The x coordinate (in world space) to position the Game Object at.
     * @param y The y coordinate (in world space) to position the Game Object at.
     * @param platformConfig Configurations for the platform
     * @param collisionTarget The player object that will collide with this platform
     */
    public awake(
        x: number,
        y: number,
        platformConfig: PlatformConfig,
        collisionTarget: Ball
    ): void {
        this.enableBody(true, x, y, true, true)

        this.setPosition(x, y)
        this.setDisplaySize(platformConfig.width, platformConfig.height)

        // set style
        this.mPlatform.color = 0x666666
        this.lPlatform.color = 0x666666
        this.rPlatform.color = 0x666666

        const body = this.body as Phaser.Physics.Arcade.Body

        if (body) {
            body.setAllowGravity(false)
            body.setImmovable(true)
            body.pushable = false
        } else {
            throw new Error('body is undefined')
        }

        this.platformConfig = platformConfig
        this.requiredAccuracy = platformConfig.requiredAcc
        this.player = collisionTarget

        this.travelLeft()
    }

    /**
     * Disable the platform's body
     */
    public sleep() {
        this.disableBody(true, true)
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

    private drawShadow(config: PlatformConfig): void {
        const heightFromBottom = this.mainCamera.height - this.mPlatform.position.y

        // draw gradient shadow
        this.graphics.clear()
        this.graphics.setDepth(this.depth + 1)
        this.graphics.fillGradientStyle(0x000000, 0x000000, 0xffffff, 0xffffff, 0.05)
        this.graphics.fillRect(
            this.lPlatform.position.x - this.lPlatform.size.x / 2,
            this.mPlatform.position.y + this.mPlatform.size.y / 2,
            config.width,
            heightFromBottom
        )
    }

    private updateGraphicPosition(config: PlatformConfig) {
        const x = this.x
        const y = this.y
        const mainWidth = config.requiredAcc * config.width
        const extraWidth = (config.width - mainWidth) / 2
        const extentOffset = mainWidth / 2 + extraWidth / 2

        this.mPlatform.position.set(x, y)
        this.mPlatform.size.set(mainWidth, config.height)

        this.lPlatform.position.set(x - extentOffset, y)
        this.lPlatform.size.set(extraWidth, config.height)

        this.rPlatform.position.set(x + extentOffset, y)
        this.rPlatform.size.set(extraWidth, config.height)
    }

    private travelLeft() {
        if (this.active) {
            this.setVelocityX(-450)
        } else {
            throw new Error('platform is inactive')
        }
    }

    private bouncePlayer(): void {
        if (this.player === undefined) {
            throw new Error('player is undefined')
        }

        const player = this.player

        // ignore collision
        player.setIgnoreInput(true)

        // wait for some time before allowing the player to move again
        this.scene.time.addEvent({
            delay: 200,
            callback: () => {
                player.setIgnoreInput(false)
            },
        })

        // bounce the player
        player.body?.velocity.set(0, -BOUNCE_VELOCITY)
    }

    private onAccurateCollision(): void {
        this.mPlatform.color = 0x88ff88
    }

    private onInaccurateCollision(isLeft: boolean): void {
        if (isLeft) {
            this.lPlatform.color = 0xffff00
        } else {
            this.rPlatform.color = 0xffff00
        }
    }

    public onCollideWithPlayer(): void {
        if (this.player === undefined) {
            throw new Error('player is undefined')
        }

        if (this.requiredAccuracy === undefined) {
            throw new Error('required accuracy is undefined')
        }

        // checks if any of the player's extent fall within the main platform's extent
        const playerWidth = this.player.width

        let playerExtentL = this.player.getLeftCenter().x
        let playerExtentR = this.player.getRightCenter().x

        const platformExtentL = this.mPlatform.position.x - this.mPlatform.size.x / 2
        const platformExtentR = this.mPlatform.position.x + this.mPlatform.size.x / 2

        if (playerExtentL === undefined || playerExtentR === undefined) {
            throw new Error('undefined extents')
        }

        // apply accuracy offset
        playerExtentL += playerWidth * this.requiredAccuracy
        playerExtentR -= playerWidth * this.requiredAccuracy

        const isAccurate =
            (playerExtentL <= platformExtentL && playerExtentR <= platformExtentL) ||
            (playerExtentL >= platformExtentR && playerExtentR >= platformExtentR)
        const isLeft = playerExtentL <= platformExtentL && playerExtentR <= platformExtentL

        // change platform color
        if (isAccurate) {
            this.onInaccurateCollision(isLeft)

            // reset multiplier
            this.player.getScoreManager().resetMultiplier()
        } else {
            this.onAccurateCollision()
        }

        // bounce player
        this.bouncePlayer()

        // add score
        this.player.getScoreManager().addScore()
    }
}
