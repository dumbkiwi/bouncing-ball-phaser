import CONDIMENTS from '@/constants/condimentMap'
import GameplayStateMachine, {
    PlayingAcceleratedState,
    PlayingState,
    StaticState,
} from '../gameplay-state/GameplayState'
import Player from '../player/Player'
import ScoreManager from '../score/ScoreManager'
import Platform from './Platform'
import PlatformCondiment from './PlatformCondiment'

const BOUNCE_VELOCITY = 1000

export default class PlatformSpawner extends Phaser.Physics.Arcade.Group {
    private config: PlatformSpawnerConfig
    private condimentGroup: {
        [key in PlatformCondimentType]: Phaser.Physics.Arcade.Group
    }

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
            maxSize: 20,
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
                const {isAccurate, isLeft} = colliderPlatform.applyCollision(
                    player,
                    this.config.requiredAcc
                )

                this.scoreManager.tryAddScore(isAccurate)

                // apply force onto player
                this.bouncePlayer(player)

                // add spin to player
                const body = this.player.body as Phaser.Physics.Arcade.Body
                let newAngularVelocity = body.angularVelocity

                
                if (isAccurate) {
                    newAngularVelocity += Math.random() * 400
                } else {
                    if (isLeft) {
                        newAngularVelocity = -Math.random() * 300
                    } else {
                        newAngularVelocity += Math.random() * 200
                    }
                }

                this.player.setAngularVelocity(newAngularVelocity)

                // create particle
                this.player.emitParticles()

                // apply collision
                this.applyHit(isAccurate)
            },
            undefined,
            this
        )

        // initialize condiment groups
        this.condimentGroup = {} as {
            [key in PlatformCondimentType]: Phaser.Physics.Arcade.Group
        }

        Object.keys(CONDIMENTS).forEach((condimentType) => {
            const key = condimentType as PlatformCondimentType

            this.condimentGroup[key] = this.createCondimentGroup(key)
            
            scene.add.existing(this.condimentGroup[key])
        })

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

        this.scene.time.addEvent({
            callback: () => {
                this.onUpdate()
            },
            delay: 50,
            loop: true,
        })
    }

    onUpdate() {
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

    private createCondimentGroup(
        condimentType: PlatformCondimentType
    ): Phaser.Physics.Arcade.Group {
        return this.scene.physics.add.group({
            classType: CONDIMENTS[condimentType],
            createCallback: (gameObject: Phaser.GameObjects.GameObject) => {
                if (gameObject instanceof PlatformCondiment) {
                    this.deactivateCondiment(gameObject, true, true)
                }
            },
            maxSize: 20,
            runChildUpdate: true,
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

    private updateSpawnArea(config: PlatformSpawnerConfig): void {
        const spawnWidth = config.maxGap - config.minGap
        const spawnX = this.mainCamera.width + config.minGap + spawnWidth / 2
        const spawnY = this.mainCamera.height / 2
        this.spawnArea.setPosition(spawnX, spawnY)
        this.spawnArea.setSize(spawnWidth, this.mainCamera.height)
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

    private updateBufferArea(config: PlatformSpawnerConfig): void {
        const bufferWidth = config.maxGap
        const bufferX = this.mainCamera.width + bufferWidth / 2
        const bufferY = this.mainCamera.height / 2
        this.bufferArea.setPosition(bufferX, bufferY)
        this.bufferArea.setSize(bufferWidth, this.mainCamera.height)
    }

    private createDespawnArea(config: PlatformSpawnerConfig): Phaser.GameObjects.Rectangle {
        // add rectangle collider to the world, offset by the camera's width
        const despawnWidth = config.maxGap
        const despawnX = -despawnWidth / 2 - config.minGap - 100
        const despawnY = 0
        return this.scene.add.rectangle(
            despawnX,
            despawnY,
            despawnWidth,
            this.mainCamera.height * 10,
            0xff0000,
            0
        ).setOrigin(0.5, 0)
    }

    private updateDespawnArea(config: PlatformSpawnerConfig): void {
        const despawnWidth = config.maxGap
        const despawnX = -despawnWidth / 2 - config.minGap - 100
        const despawnY = 0
        this.despawnArea.setPosition(despawnX, despawnY)
        this.despawnArea.setSize(despawnWidth, this.mainCamera.height * 10)
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

        platform.resetConfig(this.config.requiredAcc, {
            width,
            height,
            extraWidth: 0,
            platformColor: {
                baseColor: this.config.platformColor.baseColor,
                accurateColor: this.config.platformColor.accurateColor,
                inaccurateColor: this.config.platformColor.inaccurateColor,
            }
        })

        // set the platform to be active and awake
        this.activatePlatform(platform, true, spawnX, spawnY, true, true)

        // add condiments
        this.addOptionalCondiments(platform)

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

    private activateCondiment(
        condiment: PlatformCondiment,
        reset?: boolean,
        x?: number,
        y?: number,
        enableGameObject?: boolean,
        showGameObject?: boolean
    ) {
        condiment.enableBody(reset, x, y, enableGameObject, showGameObject)
        
        const body = condiment.body as Phaser.Physics.Arcade.Body

        if (body) {
            body.setAllowGravity(false)
            body.setImmovable(true)
            body.pushable = false
        } else {
            throw new Error('body is undefined')
        }

        // const velocity = this.gameState.getPlatformVelocity()

        // condiment.setVelocityX(velocity)
    }

    private addOptionalCondiments(platform: Platform) {
        Object.keys(this.config.condimentPropability).forEach(condimentType => {
            const key = condimentType as keyof typeof this.config.condimentPropability

            if (this.config.condimentPropability[key] > Math.random()) {
                // get the condiment from the pool
                const condiment = this.condimentGroup[key].getFirstDead(true, 0, 0, key)

                if (!condiment) {
                    console.warn('no dead condiments')
                    return
                }

                if (!(condiment instanceof PlatformCondiment)) {
                    throw new Error('condiment is not an instance of PlatformCondiment')
                }

                condiment.attachToPlatform(platform)
                platform.addCondiment(condiment)

                this.activateCondiment(condiment, true, platform.x, platform.y - platform.height / 2 - condiment.height / 2, true, true)
            }
        })
    }

    private deactivatePlatform(
        platform: Platform,
        disableGameObject?: boolean,
        hideGameObject?: boolean
    ) {
        platform.clearCondiments()
        platform.disableBody(disableGameObject, hideGameObject)
    }

    private deactivateCondiment(condiment: PlatformCondiment, disableGameObject?: boolean, hideGameObject?: boolean) {
        // debugger
        condiment.detachFromPlatform()
        condiment.disableBody(disableGameObject, hideGameObject)
    }

    /**
     * Prespawn platforms.
     */
    public prespawnPlatform(): void {
        // prespawn platforms
        this.spawnPlatform(this.mainCamera.width / 2, (this.mainCamera.height / 3) * 2)
    }

    /**
     * Change the platform spawner config.
     * @param config Platform spawner config.
     */
    public setConfig(config: PlatformSpawnerConfig) {
        this.config = config

        this.updateSpawnArea(config)
        this.updateBufferArea(config)
        this.updateDespawnArea(config)
    }
}
