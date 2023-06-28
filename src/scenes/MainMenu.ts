export default class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu')
    }

    public preload(): void {
        this.load.image('logo', 'assets/logo.png')
    }

    public create(): void {
        this.add.image(400, 800, 'logo')
        // this.input.once('pointerdown', () => {
        //     this.scene.start('Game')
        // })
    }
}