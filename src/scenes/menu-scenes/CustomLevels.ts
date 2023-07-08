import { BEATMAPS } from '@/constants/beatmaps'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import SceneController, { SceneKeys } from '../SceneController'
import OverlayUI from '../overlays/OverlayUI'
import { NORMAL, TITLE } from '@/constants/fontStyle'
import Label from 'phaser3-rex-plugins/templates/ui/label/Label'
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle'
import { BeatmapMode } from '@/classes/game-mode/GameModeStateMachine'

export default class CustomeLevels extends Phaser.Scene implements SceneWithOverlay {
    rexUI!: RexUIPlugin
    private beatmapButtons: BeatmapButton[]
    
    constructor() {
        super(SceneKeys.CustomLevels)

        this.beatmapButtons = []
    }

    createOverlay(): Promise<void> {
        return new Promise((resolve) => {
            this.scene.launch(SceneKeys.OverlayingUI)
            this.scene.moveBelow(SceneKeys.OverlayingUI)
            const overlayingUI = this.game.scene.getScene(SceneKeys.OverlayingUI) as OverlayUI
            overlayingUI.setOverlappingScene(SceneKeys.CustomLevels)

            this.game.scene.getScene(SceneKeys.OverlayingUI).load.once('complete', () => {
                resolve()
            })
        })
    }

    removeOverlay(): void {
        this.scene.sleep(SceneKeys.OverlayingUI)
        this.scene.setVisible(false, SceneKeys.OverlayingUI)
    }

    preload() {
        this.load.svg('level-play-button', 'assets/ui/play.svg')
        this.load.pack('preload', 'assets/beatmaps/pack.json', 'preload')
    }

    create() {
        const sizer = this.rexUI.add.sizer({
            orientation: 'y',
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY,
            width: this.cameras.main.width * 0.8,
            height: this.cameras.main.height * 0.9,
        })

        this.beatmapButtons = BEATMAPS.map(beatmap => this.createLevelLabel(beatmap))

        sizer.add(this.createTitle(), 0, 'center', {
            top: 20,
            bottom: 20,
        })

        sizer.add(this.createLevelBrowser(this.beatmapButtons), 1, 'center', {
            top: 20,
            bottom: 20,
        }, true)

        sizer.layout()
    }

    private createTitle() {
        const title = this.rexUI.add.label({
            width: 100,
            height: 40,
            text: this.add.text(0, 0, 'Custom Levels', TITLE),
            space: {
                left: 15,
                right: 15,
                top: 10,
                bottom: 10
            }
        })

        return title.layout()
    }

    private createLevelBrowser(buttons: BeatmapButton[]) {
        const x = this.cameras.main.centerX
        const y = this.cameras.main.centerY

        const scrollable = this.rexUI.add.scrollablePanel({
            x,
            y,
            panel: {
                child: this.createLevelPanel(buttons),
                mask: {
                    padding: 1,
                }
            },
            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, 2, 0, 0, 0x666666),
                thumb: this.rexUI.add.roundRectangle(0, 0, 8, 100, 5, 0x666666),
            },
            scrollMode: 0,
            mouseWheelScroller: {
                focus: false,
                speed: 0.5,
            }
        })

        scrollable.setChildrenInteractive({
            click: {
                mode: 'release',
            },
            over: true,
        })

        scrollable.on('child.click', (child: BeatmapButton) => {
            child.handlePointerClick()
        })

        scrollable.on('child.over', (child: BeatmapButton) => {
            console.log('child.over')
            this.beatmapButtons.forEach(button => {
                if (button === child) {
                    button.handlePointerOver()
                } else {
                    button.handlePointerOut()
                }
            })
        })
        
        return scrollable.layout()
    }

    private createLevelPanel(buttons: BeatmapButton[]): RexUIPlugin.Sizer {
        const panel = this.rexUI.add.sizer({
            orientation: 'y',
            space: {
                right: 30,
                item: 20,
            }
        })

        buttons.forEach(button => {
            panel.add(button, {
                expand: true,
            })
        })

        return panel.layout()
    }

    private createLevelLabel(beatmap: Beatmap): BeatmapButton {
        const label = this.add.existing(new BeatmapButton(this, this.rexUI, beatmap, {
            action: this.add.image(0, 0, 'level-play-button').setOrigin(0.5).setScale(2.2),
            text: this.add.text(0, 0, beatmap.key, NORMAL),
        }))

        return label.layout()
    }
}

class BeatmapButton extends Label {
    private beatmap: Beatmap
    private background: RoundRectangle

    constructor(
        scene: Phaser.Scene,
        rexUI: RexUIPlugin,
        beatmap: Beatmap,
        config?: Label.IConfig
    ) {
        const background = rexUI.add.roundRectangle(0, 0, 0, 0, 10).setStrokeStyle(2, 0x666666)

        super(scene, {
            width: 0,
            height: 0,
            background,
            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
            },
            expandTextWidth: true,
            ...config,
        })

        this.beatmap = beatmap
        this.background = background
    }

    public handlePointerOver() {
        this.background.setStrokeStyle(4, 0x666666)
    }

    public handlePointerOut() {
        this.background.setStrokeStyle(2, 0x666666)
    }

    public handlePointerClick() {
        const sceneController = this.scene.scene.get(SceneKeys.SceneController) as SceneController
        sceneController.getGameModeManager().changeState(new BeatmapMode(sceneController, this.beatmap))

        sceneController.transitionTo(SceneKeys.CustomLevels, SceneKeys.Game)
    }
}
