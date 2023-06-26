import Phaser from 'phaser'
import Ball from './Ball'

const BOUNCE_VELOCITY = 800

export default class Platform extends Phaser.Physics.Arcade.Group {
    private config: PlatformConfig

    private mPlatform: Phaser.GameObjects.Rectangle
    private lPlatform: Phaser.GameObjects.Rectangle
    private rPlatform: Phaser.GameObjects.Rectangle

    private requiredAcc: number

    private player: Ball
    private graphics: Phaser.GameObjects.Graphics
    private mainCamera: Phaser.Cameras.Scene2D.Camera

    public static preload(scene: Phaser.Scene): void {
        scene.load.image('platform-particle-square', 'assets/shapes/square.png')
    }

    constructor(
        world: Phaser.Physics.Arcade.World,
        scene: Phaser.Scene,
        x: number,
        y: number,
        platformConfig: PlatformConfig,
        collisionTarget: Ball
    ) {
        super(world, scene, {
            allowGravity: false,
            immovable: true,
        })

        const mainWidth = platformConfig.requiredAcc * platformConfig.width
        const extraWidth = (platformConfig.width - mainWidth) / 2
        const extentOffset = mainWidth / 2 + extraWidth / 2

        const mPlatform = scene.add.rectangle(x, y, mainWidth, platformConfig.height)
        const lPlatform = scene.add.rectangle(
            x - extentOffset,
            y,
            extraWidth,
            platformConfig.height
        )
        const rPlatform = scene.add.rectangle(
            x + extentOffset,
            y,
            extraWidth,
            platformConfig.height
        )

        // set style
        mPlatform.setFillStyle(0xdddddd)
        lPlatform.setFillStyle(0xdddddd)
        rPlatform.setFillStyle(0xdddddd)

        scene.physics.add.collider(
            mPlatform,
            collisionTarget,
            this.onCollideWithPlayer,
            undefined,
            this
        )
        scene.physics.add.collider(
            lPlatform,
            collisionTarget,
            this.onCollideWithPlayer,
            undefined,
            this
        )
        scene.physics.add.collider(
            rPlatform,
            collisionTarget,
            this.onCollideWithPlayer,
            undefined,
            this
        )

        this.add(mPlatform)
        this.add(lPlatform)
        this.add(rPlatform)

        this.getChildren().forEach((child) => {
            const body = child.body as Phaser.Physics.Arcade.Body

            if (body) {
                body.setAllowGravity(false)
                body.setImmovable(true)
            }
        })

        this.config = platformConfig

        this.mPlatform = mPlatform
        this.lPlatform = lPlatform
        this.rPlatform = rPlatform

        this.requiredAcc = platformConfig.requiredAcc

        this.player = collisionTarget
        this.graphics = scene.add.graphics()
        this.mainCamera = scene.cameras.main
    }

    update(): void {
        const heightFromBottom = this.mainCamera.height - this.mPlatform.y

        // draw gradient shadow
        this.graphics.clear()
        this.graphics.fillGradientStyle(0x000000, 0x000000, 0xffffff, 0xffffff, 0.05)
        this.graphics.fillRect(
            this.lPlatform.x - this.lPlatform.width / 2,
            this.mPlatform.y + this.mPlatform.height / 2,
            this.config.width,
            heightFromBottom
        )
    }

    private bouncePlayer(): void {
        // ignore collision
        this.player.setIgnoreInput(true)

        // wait for some time before allowing the player to move again
        this.scene.time.addEvent({
            delay: 200,
            callback: () => {
                this.player.setIgnoreInput(false)
            },
        })

        // bounce the player
        this.player.body?.velocity.set(0, -BOUNCE_VELOCITY)
    }

    private onAccurateCollision(): void {
        this.mPlatform.setFillStyle(0x88ff88)
    }

    private onInaccurateCollision(platform: Phaser.GameObjects.Rectangle): void {
        platform.setFillStyle(0xffff00)
    }

    private onCollideWithPlayer(): void {
        // checks if any of the player's extent fall within the main platform's extent
        const playerWidth = this.player.width
        let playerExtentL = this.player.getLeftCenter().x
        let playerExtentR = this.player.getRightCenter().x

        const platformExtentL = this.mPlatform.getLeftCenter().x
        const platformExtentR = this.mPlatform.getRightCenter().x

        if (
            playerExtentL === undefined ||
            platformExtentL === undefined ||
            playerExtentR === undefined ||
            platformExtentR === undefined
        ) {
            throw new Error('undefined extents')
        }

        // apply accuracy offset
        playerExtentL += playerWidth * this.requiredAcc
        playerExtentR -= playerWidth * this.requiredAcc

        const isAccurate =
            (playerExtentL <= platformExtentL && playerExtentR <= platformExtentL) ||
            (playerExtentL >= platformExtentR && playerExtentR >= platformExtentR)
        const isLeft = playerExtentL <= platformExtentL && playerExtentR <= platformExtentL

        // change platform color
        if (isAccurate) {
            this.onInaccurateCollision(isLeft ? this.lPlatform : this.rPlatform)
        } else {
            this.onAccurateCollision()
        }

        // bounce player
        this.bouncePlayer()
    }
}
