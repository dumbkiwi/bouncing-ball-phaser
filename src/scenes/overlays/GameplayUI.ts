import ImageButton from '@/classes/ui/ImageButton'
import { SceneKeys } from '../SceneController'
import QuickSettings from '@/classes/ui/QuickSettings'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import Gameplay from '../gameplay-scenes/Gameplay'
import { GameOverState } from '@/classes/gameplay-state/GameplayState'
import GameOver from '@/classes/ui/GameOver'

export default class GameplayUI extends Phaser.Scene {
    scene!: Phaser.Scenes.ScenePlugin
    rexUI!: RexUIPlugin

    private isPaused: boolean
    private settingsContainer!: QuickSettings
    private settingsTween: Phaser.Tweens.Tween | undefined

    private pauseButton!: ImageButton

    private gameoverContainer!: Phaser.GameObjects.Container

    private gameplayScene: Gameplay | undefined
    private gameStateCallbackId: number | undefined

    constructor() {
        super('GameOver')

        this.isPaused = false
    }

    public preload(): void {
        this.load.svg('pause-button', 'assets/ui/pause.svg', { width: 100, height: 100 })
        this.load.svg('play-button', 'assets/ui/play.svg', { width: 100, height: 100 })
        this.load.svg('volume-button', 'assets/ui/volume.svg', { width: 50, height: 50 })
        this.load.image('coin', 'assets/items/diamond.png')
    }

    public create(): void {
        this.settingsContainer = new QuickSettings(this, this.rexUI)
        this.add.existing(this.settingsContainer)

        this.hideSettings(true)

        const button = this.add.existing(
            new ImageButton(this, 80, 80, 'pause-button', () => {
                this.isPaused = !this.isPaused

                if (this.isPaused) {
                    this.showSettings()
                    button.setTexture('play-button')
                    this.scene.pause(SceneKeys.Game)
                } else {
                    this.hideSettings()
                    button.setTexture('pause-button')
                    this.scene.resume(SceneKeys.Game)
                }
            })
        )

        button.setAlpha(0.5)

        this.pauseButton = button
        this.gameoverContainer = this.add.existing(new GameOver(this, this.rexUI))
        this.gameoverContainer.setAlpha(0)
        this.gameoverContainer.setVisible(false)
    }

    private showSettings() {
        if (this.settingsTween?.isPlaying()) {
            this.settingsTween.stop()
        }

        this.settingsTween = this.tweens.add({
            targets: this.settingsContainer,
            duration: 100,
            ease: 'EaseInOut',
            repeat: 0,
            yoyo: false,
            alpha: 1,
        })
    }

    private hideSettings(immediate = false) {
        if (this.settingsTween?.isPlaying()) {
            this.settingsTween.stop()
        }

        if (immediate) {
            this.settingsContainer.setAlpha(0)
        } else {
            this.settingsTween = this.tweens.add({
                targets: this.settingsContainer,
                duration: 100,
                ease: 'EaseInOut',
                repeat: 0,
                yoyo: false,
                alpha: 0,
            })
        }
    }

    private showGameOver() {
        if (!this.gameplayScene) {
            throw new Error('Gameplay scene is not attached')
        }

        this.pauseButton.setVisible(false)

        this.gameplayScene?.cameras.main.postFX.addPixelate(6)
        this.gameoverContainer.setVisible(true)
        this.tweens.add({
            targets: this.gameoverContainer,
            duration: 100,
            ease: 'EaseInOut',
            repeat: 0,
            yoyo: false,
            alpha: 1,
        })

        const container = this.gameoverContainer as GameOver

        container.setTargetScene(this.gameplayScene)
    }

    public attachGameplay(gameplay: Gameplay): void {
        this.settingsContainer.setTargetScene(gameplay)
        this.gameplayScene = gameplay

        this.gameStateCallbackId = gameplay.getGameState().onStateChange((state) => {
            if (state instanceof GameOverState) {
                this.showGameOver()
            }
        })
    }

    public detachGameplay(): void {
        if (this.gameStateCallbackId) {
            this.gameplayScene?.getGameState().removeEventListener(this.gameStateCallbackId)
        }

        this.settingsContainer.setTargetScene(undefined)
        this.gameplayScene = undefined
    }

    public getGameplay() {
        return this.gameplayScene
    }
}
