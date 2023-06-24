import Phaser from "phaser"
import Ball from "./Ball"

const BOUNCE_VELOCITY = 800

export default class Platform extends Phaser.GameObjects.Container {
    private platform: Phaser.GameObjects.Rectangle
    private player: Ball
    constructor(config: PlatformConfig, collisionTarget: Ball, heightFromBottom: number, scene: Phaser.Scene, x?: number) {
        super(scene, 0, 0, [])
        scene.add.existing(this)

        const camera = scene.cameras.main
        const y = camera.displayHeight - heightFromBottom

        this.platform = scene.add.rectangle(x, y, config.width, config.height, 0xdddddd)

        // this.platform.setStrokeStyle(1, 0x000000)

        scene.physics.add.existing(this.platform, true)

        // shadow of the platform, rectangle from the platform to the bottom of the screen
        const shadow = scene.add
            .rectangle(x, y, config.width, heightFromBottom, 0x000000, 0.05)
            .setOrigin(0.5, 0)

        this.body = this.platform.body as Phaser.Physics.Arcade.Body
        this.player = collisionTarget

        this.add([shadow, this.platform])

        scene.physics.add.collider(this.platform, collisionTarget, this.handleCollisionWithPlayer, undefined, this)
    }

    public getPlatform(): Phaser.GameObjects.Rectangle {
        return this.platform
    }

    private handleCollisionWithPlayer(_object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile): void {
        // ignore collision
        this.player.setIgnoreInput(true)

        // wait for some time before allowing the player to move again
        this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                this.player.setIgnoreInput(false)
            }
        })

        // bounce the player
        this.player.body?.velocity.set(0, -BOUNCE_VELOCITY)
    }
}
