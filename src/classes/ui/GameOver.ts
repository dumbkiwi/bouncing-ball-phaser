import SceneController, { SceneKeys } from '@/scenes/SceneController'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import TextButton from './TextButton'
import Gameplay from '@/scenes/gameplay-scenes/Gameplay'

export default class GameOver extends Phaser.GameObjects.Container {
    private targetScene: Gameplay | undefined

    private scoreText: Phaser.GameObjects.Text
    private bestScoreText: Phaser.GameObjects.Text
    private coinText: Phaser.GameObjects.Text


    constructor(scene: Phaser.Scene, rexUI: RexUIPlugin) {
        super(scene, 0, 0)

        const height = scene.cameras.main.height
        const width = scene.cameras.main.width

        const sizer = rexUI.add.sizer({
            x: width / 2,
            y: height / 2,
            width: width,
            height: height,
            orientation: 'y',
            space: {
                left: 100,
                right: 100,
                top: 200,
                bottom: 200,
            },
            name: 'sizer',
            draggable: false,
        })

        // // background
        const bg = scene.add.rectangle(0, 0, width, height, 0xffffff, 0.5)
        sizer.addBackground(bg)

        // title
        sizer.add(
            scene.add.text(0, 0, 'Game over', {
                fontSize: '72px',
                color: '#666666',
                fontStyle: 'bold',
                fontFamily: 'Arial',
            }),
            0,
            'center',
        )

        const scoreSizer = rexUI.add.sizer({
            orientation: 'y',
        })

        // top padding
        scoreSizer.add(
            scene.add.rectangle(0, 0, 0, 0, 0xffffff, 0),
            1,
            'center',
        )
        
        // score
        this.scoreText = scene.add.text(0, 0, '0', {
            fontSize: '72px',
            color: '#666666',
            fontFamily: 'Arial',
        }).setOrigin(0.5)
        
        scoreSizer.add(
            this.scoreText,
            0,
            'center',
            {
                top: 10,
                bottom: 10,
            }
        )

        // best score
        this.bestScoreText = scene.add.text(0, 0, 'Best: 0', {
            fontSize: '54px',
            color: '#666666',
            fontFamily: 'Arial',
        }).setOrigin(0.5)

        scoreSizer.add(
            this.bestScoreText,
            0,
            'center',
            {
                top: 10,
                bottom: 10,
            }
        )

        // coin
        this.coinText = scene.add.text(0, 0, '0', {
            fontSize: '32px',
            color: '#666666',
            fontFamily: 'Arial',
            align: 'center',
        })

        scoreSizer.add(
            rexUI.add
                .label({
                    width: 200,
                    height: 80,
                    orientation: 'x',
                    background: rexUI.add.roundRectangle(0, 0, 0, 0, 10).setStrokeStyle(1, 0x666666),
                    text: this.coinText,
                    icon: scene.add.image(0, 0, 'coin').setScale(2),
                    space: {
                        icon: 10,
                        left: 15,
                        right: 15,
                    },
                    align: 'center',
                })
                .layout()
                .setDepth(1),
            0,
            'center',
            {
                top: 10,
                bottom: 10,
            }
        )

        // bottom padding
        scoreSizer.add(
            scene.add.rectangle(0, 0, 0, 0, 0xffffff, 0),
            1,
            'center',
        )

        scoreSizer.layout()

        // add score sizer to main sizer
        sizer.add(scoreSizer, 2, 'center', undefined, true)

        // restart
        sizer.add(
            scene.add
                .existing(
                    new TextButton(
                        scene,
                        0,
                        0,
                        'Restart',
                        {
                            fontSize: '64px',
                            color: '#666666',
                            fontFamily: 'Arial',
                            fontStyle: 'bold',
                        },
                        () => {
                            const controller = scene.scene.get(
                                SceneKeys.SceneController
                            ) as SceneController
                            controller.reloadScene(SceneKeys.Game)
                        }
                    )
                )
                .setOrigin(0.5, 0.5),
            0,
            'center',
            {
                top: 20,
                bottom: 20,
            },
            true
        )

        // quit
        sizer.add(
            scene.add
                .existing(
                    new TextButton(
                        scene,
                        0,
                        0,
                        'Quit',
                        {
                            fontSize: '64px',
                            color: '#666666',
                            fontFamily: 'Arial',
                            fontStyle: 'bold',
                        },
                        () => {
                            const controller = scene.scene.get(
                                SceneKeys.SceneController
                            ) as SceneController
                            controller.transitionTo(SceneKeys.Game, SceneKeys.MainMenu)
                        }
                    )
                )
                .setOrigin(0.5, 0.5),
            0,
            'center',
            {
                top: 20,
                bottom: 20,
            },
            true
        )

        sizer.layout()
        this.add([sizer])
    }

    public setTargetScene(scene: Gameplay) {
        this.targetScene = scene

        this.setScore(scene.getScoreManager().getScore())
        this.setHighScore(scene.getScoreManager().getHighScore())
        this.setCoin(0)

        scene.getScoreManager().saveScore()
    }

    private setScore(score: number) {
        this.scoreText.setText(score.toString())
    }

    private setHighScore(score: number) {
        this.bestScoreText.setText(`Best: ${score}`)
    }

    private setCoin(coin: number) {
        this.coinText.setText(coin.toString())
    }
}
