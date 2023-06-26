import Ball from '@/classes/Ball'
import Platform from '@/classes/Platform'
import Phaser from 'phaser'

export default class PlatformTestScene extends Phaser.Scene {
    preload() {
        this.load.image('ball', 'assets/bouncing-ball/1x/pearl_light.png')
        Platform.preload(this)
    }
    create() {
        const ball = new Ball(100, this, 100, 100, 'ball')
        this.physics.add.existing(ball)
        this.add.group([new Platform(this.physics.world, this, 100, 800, {
            width: 100,
            height: 20,
            extraWidth: 30,
            requiredAcc: 0.6,
            }, ball)], {
                runChildUpdate: true,
            })
    }
}