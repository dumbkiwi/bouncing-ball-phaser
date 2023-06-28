import { SceneWithRexUI } from '@/types/scene'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'
import { SceneKeys } from '../SceneController'
import OverlayUI from '../overlays/OverlayUI'

export default class Skins extends Phaser.Scene implements SceneWithOverlay {
    rexUI!: RexUIPlugin
    preload() {
        this.load.image('ball-00', 'assets/bouncing-ball/1x/pearl_black.png')
        this.load.image('ball-01', 'assets/bouncing-ball/1x/pearl_blue.png')
        this.load.image('ball-02', 'assets/bouncing-ball/1x/pearl_gray.png')
        this.load.image('ball-03', 'assets/bouncing-ball/1x/pearl_green.png')
        this.load.image('ball-04', 'assets/bouncing-ball/1x/pearl_light.png')
        this.load.image('ball-05', 'assets/bouncing-ball/1x/pearl_purple.png')
        this.load.image('ball-06', 'assets/bouncing-ball/1x/pearl_rose.png')
        this.load.image('ball-07', 'assets/bouncing-ball/1x/pearl_yellow.png')
    }

    create() {
        const sizer = this.rexUI.add.sizer({
            orientation: 'x',
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY,
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                item: 10,
            },
        })

        // TODO: Turn into an atlas and use a spritesheet
        const skins = [
            'ball-00',
            'ball-01',
            'ball-02',
            'ball-03',
            'ball-04',
            'ball-05',
            'ball-06',
            'ball-07',
        ]

        // create gridtable
        const gridTable = this.rexUI.add.gridTable({
            width: this.cameras.main.width - 100,
            height: this.cameras.main.height - 200,
            table: {
                cellHeight: 240,
                columns: 2,
                mask: {
                    padding: 2,
                },
            },

            space: {
                table: 10,
            },

            createCellContainerCallback: function (cell) {
                const scene = cell.scene as SceneWithRexUI
                const width = cell.width
                const height = cell.height
                const item = cell.item as string

                return scene.rexUI.add.label({
                    width: width,
                    height: height,

                    icon: scene.add.image(0, 0, item).setDisplaySize(128, 128),

                    text: scene.add.text(0, 0, item, {
                        fontSize: 32,
                        fontFamily: 'Arial',
                        fontStyle: 'bold',
                        color: '#000000',
                    }),

                    space: {
                        icon: 20,
                        left: 15,
                    },

                    align: 'center',
                })
            },

            items: skins,
        })

        sizer.add(gridTable)

        sizer.layout()
    }
 
    createOverlay(): Promise<void> {
        return new Promise((resolve) => {
            this.scene.launch(SceneKeys.OverlayingUI)
            this.scene.moveBelow(SceneKeys.OverlayingUI)
            const overlayingUI = this.game.scene.getScene(SceneKeys.OverlayingUI) as OverlayUI
            overlayingUI.setOverlappingScene(SceneKeys.SkinSelection)

            this.game.scene.getScene(SceneKeys.OverlayingUI).load.once('complete', () => {
                resolve()
            })
        })
    }

    removeOverlay(): void {
        this.scene.sleep(SceneKeys.OverlayingUI)
        this.scene.setVisible(false, SceneKeys.OverlayingUI)
    }
}