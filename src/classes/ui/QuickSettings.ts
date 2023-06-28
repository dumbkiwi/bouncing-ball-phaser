import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

export default class QuickSettings extends Phaser.GameObjects.Container {
    private targetScene: Phaser.Scene | undefined

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
        sizer.add(scene.add.text(0, 0, 'Settings', {fontSize: '64px', color: '#666666', fontStyle: 'bold', fontFamily: 'Arial'}), 0, 'left')

        // volume
        sizer.add(
            rexUI.add.sizer({orientation: 'x',})
                .add(scene.add.text(0, 0, 'Volume', {fontSize: '32px', color: '#666666', fontFamily: 'Arial'}), 0, 'center')
                // volume slider
                .add(rexUI.add.slider({
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
                }).setValue(1), 1, 'center', {
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

        sizer.layout()
        this.add([sizer])
    }

    public setTargetScene(scene: Phaser.Scene | undefined) {
        this.targetScene = scene
    }

    private changeVolume(value: number) {
        if (!this.targetScene) {
            console.warn('No target scene set for QuickSettings')
            return
        }

        this.targetScene.sound.setVolume(value)
    }
}