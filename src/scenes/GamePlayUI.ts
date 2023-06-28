import ImageButton from "@/classes/ui/ImageButton"
import { SceneKeys } from "./SceneController"
import QuickSettings from "@/classes/ui/QuickSettings"
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

export default class GameOver extends Phaser.Scene {
    scene!: Phaser.Scenes.ScenePlugin
    rexUI!: RexUIPlugin

    private isPaused: boolean
    private settingsContainer!: QuickSettings
    private settingsTween: Phaser.Tweens.Tween | undefined

    // private rexContainer:
    
    constructor() {
        super('GameOver')

        this.isPaused = false
    }

    public preload(): void {
        this.load.svg('pause-button', 'assets/ui/pause.svg', {width: 100, height: 100})
        this.load.svg('play-button', 'assets/ui/play.svg', {width: 100, height: 100})
        this.load.svg('volume-button', 'assets/ui/volume.svg', {width: 50, height: 50})
    }

    public create(): void {
        this.settingsContainer = new QuickSettings(this, this.rexUI)
        this.add.existing(this.settingsContainer)

        // set target scene
        const gameplayScene = this.game.scene.getScene(SceneKeys.Game)
        this.settingsContainer.setTargetScene(gameplayScene)

        this.hideSettings(true)

        const button = this.add.existing(new ImageButton(this, 80, 80, 'pause-button', () => {
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

        }))

        button.setAlpha(0.5)
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
}