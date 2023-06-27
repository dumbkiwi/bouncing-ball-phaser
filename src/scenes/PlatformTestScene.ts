import Ball from '@/classes/Ball'
import PlatformSpawner from '@/classes/PlatformSpawner'
import ScoreManager from '@/classes/ScoreManager'
import Phaser from 'phaser'

export default class PlatformTestScene extends Phaser.Scene {
    private spawner!: PlatformSpawner
    preload() {
        this.load.image('ball', 'assets/bouncing-ball/1x/pearl_light.png')

        // from platform
        this.load.image('platform-particle-square', 'assets/shapes/square.png')
        this.load.svg('platform', 'assets/shapes/square.svg')
    }
    create() {
        const scoreManager = new ScoreManager(this, this.cameras.main.width / 2, 100)

        const ball = new Ball(100, this, 250, 300, 'ball', scoreManager)
        this.physics.add.existing(ball)

        ball.setVelocityY(-400)

        this.spawner = new PlatformSpawner(this.physics.world, this, ball, {
            minGap: 200,
            maxGap: 400,
            minHeight: 800,
            maxHeight: 1000,
            minPlatformHeight: 20,
            maxPlatformHeight: 20,
            minPlatformWidth: 100,
            maxPlatformWidth: 200,
        })

        this.add.existing(this.spawner)
        this.spawner.createMultiple({
            key: 'platform',
            quantity: 20,
        })
    }

    update() {
        this.spawner.update()
    }
}