export default class ImageButton extends Phaser.GameObjects.Image {
    private scaleTween: Phaser.Tweens.Tween
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, callback: () => void) {
        super(scene, x, y, texture)

        this.setInteractive()
            .on('pointerover', () => this.enterButtonHoverState())
            .on('pointerout', () => this.enterButtonRestState())
            .on('pointerdown', () => this.enterButtonActiveState())
            .on('pointerup', () => {
                this.enterButtonHoverState()
                callback()
            })

        this.scaleTween = this.scene.tweens.add({
            targets: this,
            duration: 100,
            ease: 'EaseInOut',
            repeat: 0,
            yoyo: false,
            scale: 1,
        })
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
            scale: 1.2,
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
            scale: 1,
        })
    }
}
