import Player from '@/classes/player/Player'
import PlatformSpawner from '@/classes/platform/PlatformSpawner'
import ScoreManager from '@/classes/score/ScoreManager'
import Phaser from 'phaser'
import { SceneKeys } from '../SceneController'
import GameplayStateMachine, { StaticState } from '@/classes/gameplay-state/GameplayState'

const COLOR_MAP: PlatformColors = [
    [0xABD6F2, 0x96CBEF, 0x81C1EB, 0x6CB6E8, 0x57ACE5],
    [0xABF2C9, 0x96EFBB, 0x81EBAD, 0x6CE8A0, 0x57E592],
    [0xF2B5AB, 0xEFA396, 0xEB9181, 0xE87F6C, 0xE56C57],
    [0xF1F2AB, 0xEDEF96, 0xEAEB81, 0xE6E86C, 0xE2E557],
    [0xABACF2, 0x9698EF, 0x8183EB, 0x6C6EE8, 0x5759E5],
    [0xF2ABE5, 0xEF96DE, 0xEB81D8, 0xE86CD1, 0xE557CB],
]

export default class Gameplay extends Phaser.Scene implements SceneWithOverlay {
    scene!: Phaser.Scenes.ScenePlugin

    private spawner!: PlatformSpawner

    private gameState!: GameplayStateMachine

    preload() {
        this.load.image('player', 'assets/bouncing-ball/1x/pearl_light.png')
        this.load.svg('platform', 'assets/shapes/square.svg')

        this.gameState = new GameplayStateMachine(new StaticState())
    }

    create() {
        this.scene.launch(SceneKeys.GameUI)
        this.scene.moveBelow(SceneKeys.GameUI)

        const scoreManager = new ScoreManager(this, this.cameras.main.width / 2, 100)

        const player = new Player(this, this.cameras.main.width / 2, 450, 'player', scoreManager, this.gameState)

        // player.setVelocityY(-400)

        this.spawner = new PlatformSpawner(this.physics.world, this, player, {
            minGap: 200,
            maxGap: 400,
            minHeight: 800,
            maxHeight: 1000,
            minPlatformHeight: 20,
            maxPlatformHeight: 20,
            minPlatformWidth: 100,
            maxPlatformWidth: 200,
            requiredAcc: 0.6,
        }, this.gameState, COLOR_MAP, scoreManager
        )

        this.add.existing(this.spawner)
        this.spawner.createMultiple({
            key: 'platform',
            quantity: 20,
        })

        // prespawn platforms
        this.spawner.prespawnPlatform()
    }

    update() {
        this.spawner.update()
    }

    createOverlay(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scene.launch(SceneKeys.GameUI)
            this.scene.moveBelow(SceneKeys.GameUI)

            this.game.scene.getScene(SceneKeys.GameUI).load.on('complete', () => {
                resolve()
            })
        })
    }

    removeOverlay(): void {
        this.scene.sleep(SceneKeys.GameUI)
        this.scene.setVisible(false, SceneKeys.GameUI)
    }
}
