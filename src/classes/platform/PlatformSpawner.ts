import Player from '../player/Player'
import Platform from './Platform'

export default class PlatformSpawner extends Phaser.Physics.Arcade.Group {
    private config: PlatformSpawnerConfig

    private player: Player

    private spawnArea: Phaser.GameObjects.Rectangle
    private bufferArea: Phaser.GameObjects.Rectangle
    private despawnArea: Phaser.GameObjects.Rectangle

    private mainCamera: Phaser.Cameras.Scene2D.Camera

    constructor(
        world: Phaser.Physics.Arcade.World,
        scene: Phaser.Scene,
        player: Player,
        config: PlatformSpawnerConfig
    ) {
        super(world, scene, {
            classType: Platform,
            createCallback: (gameObject: Phaser.GameObjects.GameObject) => {
                if (gameObject instanceof Platform) {
                    gameObject.sleep()
                }
            },
            maxSize: 5,
            runChildUpdate: true,
        })

        this.world.addCollider(
            this,
            player,
            (
                _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
                platform: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
            ) => {
                if (platform instanceof Platform) {
                    platform.onCollideWithPlayer()
                } else {
                    throw new Error('platform is not a Platform')
                }
            }
        )

        this.config = config

        this.player = player

        this.mainCamera = scene.cameras.main

        this.spawnArea = this.createSpawnArea(config)
        this.bufferArea = this.createBufferArea(config)
        this.despawnArea = this.createDespawnArea(config)
    }

    update() {
        // if there is no platform in the buffer area, create one
        const {
            left: bufferLeft,
            top: bufferTop,
            width: bufferWidth,
            height: bufferHeight,
        } = this.bufferArea.getBounds()
        const bodies = this.scene.physics.overlapRect(
            bufferLeft,
            bufferTop,
            bufferWidth,
            bufferHeight
        )
        if (!bodies.some((body) => body.gameObject instanceof Platform)) {
            this.createPlatform()
        }

        // if there is a platform in the despawn area, despawn it
        const {
            left: despawnLeft,
            top: despawnTop,
            width: despawnWidth,
            height: despawnHeight,
        } = this.despawnArea.getBounds()
        const bodiesToDespawn = this.scene.physics.overlapRect(
            despawnLeft,
            despawnTop,
            despawnWidth,
            despawnHeight
        )
        bodiesToDespawn.forEach((body) => {
            if (body.gameObject instanceof Platform) {
                body.gameObject.sleep()
            }
        })
    }

    private createSpawnArea(config: PlatformSpawnerConfig): Phaser.GameObjects.Rectangle {
        // add rectangle collider to the world, in the center of the spawn
        const spawnWidth = config.maxGap - config.minGap
        const spawnX = this.mainCamera.width + config.minGap + spawnWidth / 2
        const spawnY = this.mainCamera.height / 2
        return this.scene.add.rectangle(
            spawnX,
            spawnY,
            spawnWidth,
            this.mainCamera.height,
            0x0000ff,
            0
        )
    }

    private createBufferArea(config: PlatformSpawnerConfig): Phaser.GameObjects.Rectangle {
        // add rectangle collider to the world, offset by the camera's width
        const bufferWidth = config.maxGap
        const bufferX = this.mainCamera.width + bufferWidth / 2
        const bufferY = this.mainCamera.height / 2
        return this.scene.add.rectangle(
            bufferX,
            bufferY,
            bufferWidth,
            this.mainCamera.height,
            0xff0000,
            0
        )
    }

    private createDespawnArea(config: PlatformSpawnerConfig): Phaser.GameObjects.Rectangle {
        // add rectangle collider to the world, offset by the camera's width
        const despawnWidth = config.maxGap
        const despawnX = -despawnWidth / 2 - config.minGap
        const despawnY = this.mainCamera.height / 2
        return this.scene.add.rectangle(
            despawnX,
            despawnY,
            despawnWidth,
            this.mainCamera.height,
            0x000000,
            0
        )
    }

    private createPlatform(): Platform | null {
        if (!this.config) {
            throw new Error('config is not defined')
        }

        const platform = this.getFirstDead(false, 0, 0, 'platform') as Platform

        if (!platform) {
            console.warn('no dead platforms')
            return null
        }

        const { left: spawnLeft, width: spawnWidth } = this.spawnArea.getBounds()

        const spawnX = Math.random() * spawnWidth + spawnLeft
        const spawnY =
            Math.random() * (this.config.maxHeight - this.config.minHeight) + this.config.minHeight

        platform.awake(
            spawnX,
            spawnY,
            {
                width:
                    Math.random() * (this.config.maxPlatformWidth - this.config.minPlatformWidth) +
                    this.config.minPlatformWidth,
                height:
                    Math.random() *
                        (this.config.maxPlatformHeight - this.config.minPlatformHeight) +
                    this.config.minPlatformHeight,
                extraWidth: 0,
                requiredAcc: 0.6,
            },
            this.player
        )

        return platform
    }
}
