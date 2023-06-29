import GameplayStateMachine, {
    PlayingAcceleratedState,
    PlayingState,
    StaticState,
} from '../gameplay-state/GameplayState'
import Player from '../player/Player'
import ScoreManager from '../score/ScoreManager'
import Platform from './Platform'

const BOUNCE_VELOCITY = 800

export default class PlatformSpawner extends Phaser.Physics.Arcade.Group {
    private config: PlatformSpawnerConfig

    private player: Player

    private spawnArea: Phaser.GameObjects.Rectangle
    private bufferArea: Phaser.GameObjects.Rectangle
    private despawnArea: Phaser.GameObjects.Rectangle

    private mainCamera: Phaser.Cameras.Scene2D.Camera
    private gameState: GameplayStateMachine
    private scoreManager: ScoreManager

    private colorMap: PlatformColors
    private shadowColor: number

    constructor(
        world: Phaser.Physics.Arcade.World,
        scene: Phaser.Scene,
        player: Player,
        config: PlatformSpawnerConfig,
        gameState: GameplayStateMachine,
        colorMap: PlatformColors,
        scoreManager: ScoreManager
    ) {
        super(world, scene, {
            classType: Platform,
            createCallback: (gameObject: Phaser.GameObjects.GameObject) => {
                if (gameObject instanceof Platform) {
                    this.deactivatePlatform(gameObject, true, true)
                }
            },
            maxSize: 5,
            runChildUpdate: true,
        })

        this.world.addCollider(
            this,
            player,
            (
                collidedPlayer:
                    | Phaser.Types.Physics.Arcade.GameObjectWithBody
                    | Phaser.Tilemaps.Tile,
                colliderPlatform:
                    | Phaser.Types.Physics.Arcade.GameObjectWithBody
                    | Phaser.Tilemaps.Tile
            ) => {
                if (!(collidedPlayer instanceof Player)) {
                    throw new Error('player is not a Player')
                }

                if (!(colliderPlatform instanceof Platform)) {
                    throw new Error('platform is not a Platform')
                }

                // if static state, set playing state
                if (gameState.getState() instanceof StaticState) {
                    gameState.changeState(new PlayingState())
                }

                // if it is an accurate hit, add chainable score
                const { isAccurate } = colliderPlatform.applyCollision(
                    player,
                    this.config.requiredAcc
                )
                this.scoreManager.tryAddScore(isAccurate)

                // apply force onto player
                this.bouncePlayer(player)

                // create particle
                this.player.emitParticles()

                // apply collision
                this.applyHit(isAccurate)
            },
            undefined,
            this
        )

        // update the platform state when the game state changes
        gameState.onStateChange(() => {
            this.updatePlatformStates()
        })

        this.config = config

        this.player = player

        this.mainCamera = scene.cameras.main

        this.spawnArea = this.createSpawnArea(config)
        this.bufferArea = this.createBufferArea(config)
        this.despawnArea = this.createDespawnArea(config)

        this.gameState = gameState
        this.scoreManager = scoreManager

        this.shadowColor = gameState.getNextPlatformShadowColor()
        this.colorMap = colorMap
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
            this.spawnPlatform()
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
            if (body.gameObject instanceof Platform && body.gameObject.active) {
                this.deactivatePlatform(body.gameObject, true, true)
            }
        })
    }

    private bouncePlayer(player: Player): void {
        player.setIgnoreInput(true)

        // wait for some time before allowing the player to move again
        this.scene.time.delayedCall(200, () => {
            player.setIgnoreInput(false)
        })

        // bounce the player
        const body = player.body as Phaser.Physics.Arcade.Body

        if (!body) {
            throw new Error('player body is undefined')
        }

        body.setVelocityY(-BOUNCE_VELOCITY)
    }

    private applyHit(isAccurate: boolean) {
        let changed = false

        if (isAccurate) {
            changed = this.applyAccurateHit()
        } else {
            changed = this.applyInaccurateHit()
        }

        // If game state had changed.
        // This would've been called automatically.
        if (!changed) {
            this.updatePlatformStates()
        }
    }

    private updatePlatformStates() {
        const velocity = this.gameState.getState().getPlatformVelocity()
        this.shadowColor = this.gameState.getState().getNextPlatformShadowColor()

        this.setAllPlatform(velocity, this.shadowColor)
    }

    private applyInaccurateHit() {
        let changed = false
        if (this.gameState.getState() instanceof PlayingAcceleratedState) {
            this.gameState.changeState(new PlayingState())
            changed = true
        }

        return changed
    }

    private applyAccurateHit() {
        let changed = false
        if (this.gameState.getState() instanceof PlayingState) {
            this.gameState.changeState(new PlayingAcceleratedState(this.colorMap))
            changed = true
        }

        return changed
    }

    private setAllPlatform(velocity: number, color: number) {
        // update child platforms' shadow color and velocity
        this.getChildren().forEach((child) => {
            if (!(child instanceof Platform)) {
                throw new Error('child is not a Platform')
            }

            // update shadow color
            this.setPlatform(child, velocity, color)
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
            0.2
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
            0.5
        )
    }

    private createDespawnArea(config: PlatformSpawnerConfig): Phaser.GameObjects.Rectangle {
        // add rectangle collider to the world, offset by the camera's width
        const despawnWidth = config.maxGap
        const despawnX = -despawnWidth / 2 - config.minGap - 100
        const despawnY = this.mainCamera.height / 2
        return this.scene.add.rectangle(
            despawnX,
            despawnY,
            despawnWidth,
            this.mainCamera.height,
            0xff0000,
            0
        )
    }

    public prespawnPlatform(): void {
        // prespawn platforms
        this.spawnPlatform(this.mainCamera.width / 2, (this.mainCamera.height / 3) * 2)
    }

    private spawnPlatform(x?: number, y?: number): Platform | null {
        if (!this.config) {
            throw new Error('config is not defined')
        }

        const platform = this.getFirstDead(false, 0, 0, 'platform') as Platform

        if (!platform) {
            console.warn('no dead platforms')
            return null
        }

        const { left: spawnLeft, width: spawnWidth } = this.spawnArea.getBounds()

        const spawnX = x ?? Math.random() * spawnWidth + spawnLeft
        const spawnY =
            y ??
            Math.random() * (this.config.maxHeight - this.config.minHeight) + this.config.minHeight

        const width =
            Math.random() * (this.config.maxPlatformWidth - this.config.minPlatformWidth) +
            this.config.minPlatformWidth
        const height =
            Math.random() * (this.config.maxPlatformHeight - this.config.minPlatformHeight) +
            this.config.minPlatformHeight

        platform.resetConfig({
            width,
            height,
            extraWidth: 0,
            requiredAcc: this.config.requiredAcc,
        })

        // set the platform to be active and awake
        this.activatePlatform(platform, true, spawnX, spawnY, true, true)

        return platform
    }

    private setPlatform(platform: Platform, velocity: number, color: number) {
        // set the platform's shadow color and velocity
        platform.setVelocityX(velocity)

        // set the platform's shadow color
        platform.setShadowColor(color)
    }

    private activatePlatform(
        platform: Platform,
        reset?: boolean,
        x?: number,
        y?: number,
        enableGameObject?: boolean,
        showGameObject?: boolean
    ) {
        platform.enableBody(reset, x, y, enableGameObject, showGameObject)

        const body = platform.body as Phaser.Physics.Arcade.Body

        if (body) {
            body.setAllowGravity(false)
            body.setImmovable(true)
            body.pushable = false
        } else {
            throw new Error('body is undefined')
        }

        const velocity = this.gameState.getPlatformVelocity()

        this.setPlatform(platform, velocity, this.shadowColor)
    }

    private deactivatePlatform(
        platform: Platform,
        disableGameObject?: boolean,
        hideGameObject?: boolean
    ) {
        platform.disableBody(disableGameObject, hideGameObject)
    }
}
