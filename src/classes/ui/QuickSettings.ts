import SceneController, { SceneKeys } from '@/scenes/SceneController'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import TextButton from './TextButton'
import { SetPlayerDataAction, setPlayerData } from '../player/PlayerContext'

export default class QuickSettings extends Phaser.GameObjects.Container {
    private targetScene: Phaser.Scene | undefined
    private volumeSlider: RexUIPlugin.Slider | undefined

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

        // background
        sizer.addBackground(scene.add.rectangle(0, 0, width, height, 0xffffff, 1))

        // title
        sizer.add(
            scene.add.text(0, 0, 'Settings', {
                fontSize: '64px',
                color: '#666666',
                fontStyle: 'bold',
                fontFamily: 'Arial',
            }),
            0,
            'left'
        )

        // volume
        this.volumeSlider = 
            rexUI.add
                .slider({
                    width: 200,
                    height: 20,
                    orientation: 'x',
                    track: rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0xaaaaaa),
                    indicator: rexUI.add.roundRectangle(0, 0, 0, 0, 6, 0x666666),
                    thumb: rexUI.add.roundRectangle(0, 0, 0, 0, 16, 0x666666),
                    valuechangeCallback: (value: number) => {
                        this.changeVolume(value)
                    },
                    input: 'click',
                })
                .setValue(1)
        sizer.add(
            rexUI.add
                .sizer({ orientation: 'x' })
                .add(
                    scene.add.text(0, 0, 'Volume', {
                        fontSize: '32px',
                        color: '#666666',
                        fontFamily: 'Arial',
                    }),
                    0,
                    'center'
                )
                // volume slider
                .add(this.volumeSlider, 1,
                    'center',
                    {
                        left: 20,
                        right: 20,
                    }),
            0,
            'left',
            {
                top: 20,
                bottom: 20,
            },
            true
        )

        // exit to mainMenu
        sizer.add(
            scene.add
                .existing(
                    new TextButton(
                        scene,
                        0,
                        0,
                        'Exit to main menu',
                        {
                            fontSize: '32px',
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

    public setTargetScene(scene: Phaser.Scene | undefined) {
        this.targetScene = scene

        if (!this.targetScene) {
            return
        }
    
        this.volumeSlider?.setValue(this.targetScene.sound.volume)
    }

    private changeVolume(value: number) {
        if (!this.targetScene) {
            console.warn('No target scene set for QuickSettings')
            return
        }

        this.targetScene.sound.volume = value

        setPlayerData(this.targetScene, {
            type: SetPlayerDataAction.SET_SETTINGS,
            payload: {
                volume: value,
            },
            saveImmediately: true,
        })
    }
}
