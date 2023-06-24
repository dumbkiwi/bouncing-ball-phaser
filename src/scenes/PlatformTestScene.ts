import Ball from '@/classes/Ball'
import Platform from '@/classes/Platform'
import Phaser from 'phaser'

export default class PlatformTestScene extends Phaser.Scene {
    preload() {
        this.load.image('ball', 'assets/bouncing-ball/1x/pearl_light.png')
    }
    create() {
        const ball = new Ball(100, this, 100, 100, 'ball')
        this.physics.add.existing(ball)
        const platform = new Platform({width: 100, height: 20}, ball, 300, this, 100)
    }
}