import { SceneKeys } from "../SceneController"

export default class Loading extends Phaser.Scene implements SceneWithTransition {
    private titleText!: Phaser.GameObjects.Text
    private logo!: Phaser.GameObjects.Image
    private bg!: Phaser.GameObjects.Rectangle

    constructor() {
        super(SceneKeys.Loading)
    }

    public preload(): void {
        this.load.svg('loading-logo', 'assets/loadingball.svg', {width: 300, height: 300})
    }

    public create(): void {
        const camera = this.cameras.main

        const bg = this.add.rectangle(0, 0, camera.width, camera.height, 0xffffff).setOrigin(0)

        const logo = this.add.image(camera.width / 2, camera.height / 2 - 100, 'loading-logo').setAlpha(0.5)

        const titleText = this.add.text(camera.width / 2, camera.height / 2 + 150, 'Bouncing Ball', {
            fontFamily: 'Arial',
            fontSize: 64,
            color: '#888888',
            fontStyle: 'bold',
        }).setOrigin(0.5)

        this.events.on('transitionstart', (_fromScene: Phaser.Scene, _duration: number) => {
            this.transitionIn()
        })

        this.events.on('transitionout', (_toScene: Phaser.Scene, _duration: number) => {
            this.transitionOut()
        })

        // rotate the logo
        this.tweens.add({
            targets: logo,
            angle: 360,
            duration: 9000,
            repeat: -1,
        })

        this.logo = logo
        this.titleText = titleText
        this.bg = bg
    }

    public async transitionIn() {
        const camera = this.cameras.main

        // set bg alpha
        this.bg.setAlpha(0)

        // set top of the screen
        this.logo.setPosition(camera.width / 2, -this.logo.height / 2)

        // set bottom of the screen
        this.titleText.setPosition(camera.width / 2, camera.height + this.titleText.height / 2)

        const logoPromise = new Promise<void>((resolve) => {
            // tween logo from the top
            this.tweens.add({
                targets: this.logo,
                y: camera.height / 2 - 100,
                ease: 'Sine.easeOut',
                duration: 900,
                repeat: 0,
                onComplete: () => {
                    resolve()
                }
            })
        })
        
        const titlePromise = new Promise<void>((resolve) => {
            // tween titleText from the bottom
            this.tweens.add({
                targets: this.titleText,
                y: camera.height / 2 + 150,
                ease: 'Sine.easeOut',
                duration: 900,
                repeat: 0,
                onComplete: () => {
                    resolve()
                }
            })
        })

        const bgPromise = new Promise<void>((resolve) => {
            // fade
            this.tweens.add({
                targets: this.bg,
                alpha: 1,
                ease: 'Sine.easeOut',
                duration: 900,
                repeat: 0,
                onComplete: () => {
                    resolve()
                }
            })
        })

        await Promise.all([logoPromise, titlePromise, bgPromise])
    }

    public async transitionOut() {
        const camera = this.cameras.main
        const movementPromise = new Promise<void>((resolve) => {
            // tween logo to the top
            this.tweens.add({
                targets: this.logo,
                y: -this.logo.height / 2,
                ease: 'Sine.easeInOut',
                duration: 900,
                repeat: 0,
                onComplete: () => {
                    resolve()
                }
            })
        })

        const titlePromise = new Promise<void>((resolve) => {
            // tween titleText to the bottom
            this.tweens.add({
                targets: this.titleText,
                y: camera.height + this.titleText.height / 2,
                ease: 'Sine.easeInOut',
                duration: 900,
                repeat: 0,
                onComplete: () => {
                    resolve()
                }
            })
        })

        const bgPromise = new Promise<void>((resolve) => {
            // fade
            this.tweens.add({
                delay: 600,
                targets: this.bg,
                alpha: 0,
                ease: 'Sine.easeInOut',
                duration: 900,
                repeat: 0,
                onComplete: () => {
                    resolve()
                }
            })
        })

        await Promise.all([movementPromise, titlePromise, bgPromise])
    }
}