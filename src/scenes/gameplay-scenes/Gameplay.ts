import Player from '@/classes/player/Player'
import PlatformSpawner from '@/classes/platform/PlatformSpawner'
import ScoreManager from '@/classes/score/ScoreManager'
import Phaser from 'phaser'
import { SceneKeys } from '../SceneController'
import GameplayStateMachine, { StaticState } from '@/classes/gameplay-state/GameplayState'
import GameplayUI from '../overlays/GameplayUI'

const COLOR_MAP: PlatformColors = [
    [0xabd6f2, 0x96cbef, 0x81c1eb, 0x6cb6e8, 0x57ace5],
    [0xabf2c9, 0x96efbb, 0x81ebad, 0x6ce8a0, 0x57e592],
    [0xf2b5ab, 0xefa396, 0xeb9181, 0xe87f6c, 0xe56c57],
    [0xf1f2ab, 0xedef96, 0xeaeb81, 0xe6e86c, 0xe2e557],
    [0xabacf2, 0x9698ef, 0x8183eb, 0x6c6ee8, 0x5759e5],
    [0xf2abe5, 0xef96de, 0xeb81d8, 0xe86cd1, 0xe557cb],
]

export default class Gameplay extends Phaser.Scene implements SceneWithOverlay {
    scene!: Phaser.Scenes.ScenePlugin

    private spawner!: PlatformSpawner

    private gameState!: GameplayStateMachine

    private scoreManager!: ScoreManager

    preload() {
        this.load.image('player', 'assets/bouncing-ball/1x/pearl_light.png')
        this.load.svg('platform', 'assets/shapes/square.svg')
        this.load.svg('square', 'assets/shapes/square.svg')

        this.gameState = new GameplayStateMachine(new StaticState())
    }

    create() {
        this.scene.launch(SceneKeys.GameUI)
        this.scene.moveBelow(SceneKeys.GameUI)

        const scoreManager = new ScoreManager(this, this.cameras.main.width / 2, 100)

        const player = new Player(
            this,
            this.cameras.main.width / 2,
            450,
            'player',
            scoreManager,
            this.gameState
        )

        // player.setVelocityY(-400)

        this.spawner = new PlatformSpawner(
            this.physics.world,
            this,
            player,
            {
                minGap: 200,
                maxGap: 400,
                minHeight: 800,
                maxHeight: 1000,
                minPlatformHeight: 20,
                maxPlatformHeight: 20,
                minPlatformWidth: 100,
                maxPlatformWidth: 200,
                requiredAcc: 0.6,
            },
            this.gameState,
            COLOR_MAP,
            scoreManager
        )

        this.add.existing(this.spawner)
        this.spawner.createMultiple({
            key: 'platform',
            quantity: 20,
        })

        // prespawn platforms
        this.spawner.prespawnPlatform()

        this.scoreManager = scoreManager
    }

    update() {
        // this.spawner.update()
    }

    createOverlay(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scene.launch(SceneKeys.GameUI)
            this.scene.moveBelow(SceneKeys.GameUI)

            const scene = this.game.scene.getScene(SceneKeys.GameUI) as GameplayUI

            scene.load.once('complete', () => {
                resolve()
            })

            scene.events.once('create', () => {
                scene.attachGameplay(this)
            })
        })
    }

    removeOverlay(): void {
        this.scene.sleep(SceneKeys.GameUI)
        this.scene.setVisible(false, SceneKeys.GameUI)

        const scene = this.game.scene.getScene(SceneKeys.GameUI) as GameplayUI
        scene.detachGameplay()
    }

    public getGameState(): GameplayStateMachine {
        return this.gameState
    }

    public getScoreManager(): ScoreManager {
        return this.scoreManager
    }
}
