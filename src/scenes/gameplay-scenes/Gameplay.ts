import Ball from '@/classes/Ball'
import PlatformSpawner from '@/classes/PlatformSpawner'
import ScoreManager from '@/classes/ScoreManager'
import Phaser from 'phaser'
import { SceneKeys } from '../SceneController'

export default class Gameplay extends Phaser.Scene implements SceneWithOverlay {
    scene!: Phaser.Scenes.ScenePlugin
    private spawner!: PlatformSpawner
    preload() {
        this.load.image('ball', 'assets/bouncing-ball/1x/pearl_light.png')
        this.load.svg('platform', 'assets/shapes/square.svg')
    }
    
    create() {
        this.scene.launch(SceneKeys.GameUI)
        this.scene.moveBelow(SceneKeys.GameUI)

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

    createOverlay(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scene.launch(SceneKeys.GameUI)
            this.scene.moveBelow(SceneKeys.GameUI)

            this.game.scene.getScene(SceneKeys.GameUI).load.on('complete', () => {
                resolve()
            })
        })
    }

    removeOverlay(): void {
        this.scene.sleep(SceneKeys.GameUI)
        this.scene.setVisible(false, SceneKeys.GameUI)
    }
}