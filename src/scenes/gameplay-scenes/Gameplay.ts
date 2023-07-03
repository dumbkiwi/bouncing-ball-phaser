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
import { getPlayerData } from '@/classes/player/PlayerContext'

export default class Gameplay extends Phaser.Scene implements SceneWithOverlay {
    scene!: Phaser.Scenes.ScenePlugin

    private spawner!: PlatformSpawner

    private gameStateManager!: GameplayStateMachine

    private scoreManager!: ScoreManager

    preload() {
        this.load.svg('platform', 'assets/shapes/square.svg')
        this.load.svg('square', 'assets/shapes/square.svg')
        this.load.svg('left-spike' as PlatformCondimentType, 'assets/shapes/triangle.svg', {width: 40, height: 40})
        this.load.svg('right-spike' as PlatformCondimentType, 'assets/shapes/triangle.svg', {width: 40, height: 40})

        
        // audio
        this.load.audio('score', 'assets/audio/score/combo_1.wav')
        this.load.audio('player-death', 'assets/audio/player/player_death.wav')

        for (let i = 1; i <= 17; i++) {
            this.load.audio(`score-combo_${i}`, `assets/audio/score/combo_${i}.wav`)
        }

        // coin
        this.load.audio('coin-pickup', 'assets/audio/coin/coin_pickup.wav')
    }

    create() {
        const playerData = getPlayerData(this)
        const difficultyManager = new DifficultyManager(DIFFICULTY_RUBRICS)

        this.gameStateManager = new GameplayStateMachine(new StaticState())
        this.scoreManager = new ScoreManager(this, this.cameras.main.centerX, 100)
        const player = new Player(
            this,
            this.cameras.main.width / 2,
            450,
            `skins-${playerData.equippedSkin.toString()}`,
            this.scoreManager,
            this.gameStateManager
        )

        this.spawner = this.add.existing(new PlatformSpawner(
            this.physics.world,
            this,
            player,
            difficultyManager.getPlatformConfig(0),
            this.gameStateManager,
            COLOR_MAP,
            this.scoreManager
        ))

        this.spawner.createMultiple({
            key: 'platform',
            quantity: 20,
        })

        this.scoreManager.onScoreChange((score) => {
            this.spawner.setConfig(difficultyManager.getPlatformConfig(score))
        })

        // prespawn platforms
        this.spawner.prespawnPlatform()
    }

    createOverlay(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scene.launch(SceneKeys.GameUI)
            this.scene.moveBelow(SceneKeys.GameUI)

            const scene = this.game.scene.getScene(SceneKeys.GameUI) as GameplayUI

            scene.events.once('create', () => {
                scene.attachGameplay(this)
                resolve()
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
        return this.gameStateManager
    }

    public getScoreManager(): ScoreManager {
        return this.scoreManager
    }
}
