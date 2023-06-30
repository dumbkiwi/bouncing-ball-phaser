import Player from '@/classes/player/Player'
import PlatformSpawner from '@/classes/platform/PlatformSpawner'
import ScoreManager from '@/classes/score/ScoreManager'
import Phaser from 'phaser'
import { SceneKeys } from '../SceneController'
import GameplayStateMachine, { StaticState } from '@/classes/gameplay-state/GameplayState'
import GameplayUI from '../overlays/GameplayUI'
import DifficultyManager from '@/classes/difficulty-manager/DifficultyManager'
import COLOR_MAP from '@/constants/colorMap'
import DIFFICULTY_RUBRICS from '@/constants/difficultyRubrics'

export default class Gameplay extends Phaser.Scene implements SceneWithOverlay {
    scene!: Phaser.Scenes.ScenePlugin

    private spawner!: PlatformSpawner

    private gameState!: GameplayStateMachine

    private scoreManager!: ScoreManager

    preload() {
        this.load.image('player', 'assets/bouncing-ball/1x/pearl_light.png')
        this.load.svg('platform', 'assets/shapes/square.svg')
        this.load.svg('square', 'assets/shapes/square.svg')
        this.load.svg('left-spike' as PlatformCondimentType, 'assets/shapes/triangle.svg', {width: 40, height: 40})
        this.load.svg('right-spike' as PlatformCondimentType, 'assets/shapes/triangle.svg', {width: 40, height: 40})
        this.load.image('coin' as PlatformCondimentType, 'assets/items/diamond.png')

        this.gameState = new GameplayStateMachine(new StaticState())
    }

    create() {
        this.scene.launch(SceneKeys.GameUI)
        this.scene.moveBelow(SceneKeys.GameUI)

        const scoreManager = new ScoreManager(this, this.cameras.main.width / 2, 100)

        const difficultyManager = new DifficultyManager(DIFFICULTY_RUBRICS)

        const player = new Player(
            this,
            this.cameras.main.width / 2,
            450,
            'player',
            scoreManager,
            this.gameState
        )

        this.spawner = new PlatformSpawner(
            this.physics.world,
            this,
            player,
            difficultyManager.getPlatformConfig(0),
            this.gameState,
            COLOR_MAP,
            scoreManager
        )

        this.add.existing(this.spawner)
        this.spawner.createMultiple({
            key: 'platform',
            quantity: 20,
        })

        scoreManager.onScoreChange((score) => {
            console.log('score change', score)
            this.spawner.setConfig(difficultyManager.getPlatformConfig(score))
        })

        // prespawn platforms
        this.spawner.prespawnPlatform()

        this.scoreManager = scoreManager
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
