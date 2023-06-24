import Phaser from 'phaser'

export default class UI extends Phaser.Scene {
    preload() {
        this.load.atlas('ui', 'assets/ui/nine-slice.png', 'assets/ui/nine-slice.json')
    }

    create() {
        const button1 = this.add.nineslice(0, 100, 'ui', 'blue-box', 128, 110, 64, 64).setOrigin(0, 0.5)
    }
}