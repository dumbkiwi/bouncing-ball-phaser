export default class TextButton extends Phaser.GameObjects.Text {
    private scaleTween: Phaser.Tweens.Tween
    constructor(scene: Phaser.Scene, x: number, y: number, text: string | string[], style: Phaser.Types.GameObjects.Text.TextStyle, callback?: () => void) {
        super(scene, x, y, text, style)

        this.setInteractive()
            .on('pointerover', () => this.enterButtonHoverState())
            .on('pointerout', () => this.enterButtonRestState())
            .on('pointerdown', () => this.enterButtonActiveState())
            .on('pointerup', () => {
                this.enterButtonHoverState()
                callback?.()
            })

        this.scaleTween = this.scene.tweens.add({
            targets: this,
            duration: 100,
            ease: 'EaseInOut',
            repeat: 0,
            yoyo: false,
            alpha: 1,
        })

        this.enterButtonRestState()
    }

    private enterButtonHoverState() {
        if (this.scaleTween.isPlaying()) {
            this.scaleTween.stop()
        }
        this.scaleTween = this.scene.tweens.add({
            targets: this,
            duration: 100,
            ease: 'EaseInOut',
            repeat: 0,
            yoyo: false,
            alpha: 1,
            scale: 1,
        })
    }

    private enterButtonRestState() {
        // this.scaleTween.updateTo('scale', 1, true)
        if (this.scaleTween.isPlaying()) {
            this.scaleTween.stop()
        }
        this.scaleTween = this.scene.tweens.add({
            targets: this,
            duration: 100,
            ease: 'EaseInOut',
            repeat: 0,
            yoyo: false,
            alpha: 0.5,
            scale: 1,
        })
    }

    private enterButtonActiveState() {
        // this.scaleTween.updateTo('scale', 0.8, true)
        if (this.scaleTween.isPlaying()) {
            this.scaleTween.stop()
        }
        this.scaleTween = this.scene.tweens.add({
            targets: this,
            duration: 50,
            ease: 'EaseInOut',
            repeat: 0,
            yoyo: false,
            alpha: 1,
            scale: 0.9,
        })
    }
}
