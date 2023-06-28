import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import { SceneKeys } from './SceneController'
import OverlayUI from './OverlayUI'

export default class Credits extends Phaser.Scene {
    rexUI!: RexUIPlugin
    preload() {
        //
    }
    
    create() {
        const width = this.cameras.main.width - 100
        const sizer = this.rexUI.add.sizer({
            orientation: 'y',
            x: 400,
            y: 300,
            width,
            anchor: {
                centerX: 'center',
                centerY: 'center'
            }
        })

        // uncomment to see the sizer's bounds
        // sizer.addBackground(this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, 0x333333))

        const title = this.add.text(0, 0, 'Credits', {
            fontSize: 94,
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#666666',
            align: 'center'
        })

        const by = this.createHeading('Game by')
        const byParagraph = this.createParagraph('Nhan T. Nguyen', width - 10)

        const music = this.createHeading('Music by')
        const musicParagraph0 = this.createParagraph('This [video/theatre piece/...] uses these sounds from freesound:', width - 10)
        const musicParagraph1 = this.createParagraph('"sound1" by user1 ( http://freesound.org/s/soundID/ ) licensed under CCBYNC 4.0', width - 10)
        const musicParagraph2 = this.createParagraph('"sound2", "sound3" by user2 ( http://freesound.org/people/user2/ ) licensed under CCBY 4.0', width - 10)
        const musicParagraph3 = this.createParagraph('etc..', width - 20)

        sizer.add(title, 0, 'center', {
            top: 40,
            bottom: 40
        }, false)
        sizer.add(by, 0, 'center', {
            top: 20,
            bottom: 20
        }, false)
        sizer.add(byParagraph, 0, 'center', 0, false)
        sizer.add(music, 0, 'center', {
            top: 20,
            bottom: 20
        }, false)
        sizer.add(musicParagraph0, 0, 'center', {
            top: 10,
            bottom: 10
        }, false)
        sizer.add(musicParagraph1, 0, 'center', {
            top: 10,
            bottom: 10
        }, false)
        sizer.add(musicParagraph2, 0, 'center', {
            top: 10,
            bottom: 10
        }, false)
        sizer.add(musicParagraph3, 0, 'center', {
            top: 10,
            bottom: 10
        }, false)

        sizer.layout()

        this.add.existing(sizer)
    }

    private createHeading(text: string) {
        return this.add.text(0, 0, text, {
            fontSize: 54,
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#666666',
            align: 'center'
        })
    }

    private createParagraph(text: string, maxWidth = 800) {
        return this.add.text(0, 0, text, {
            fontSize: 32,
            fontFamily: 'Arial',
            fontStyle: 'normal',
            color: '#666666',
            align: 'center',
            wordWrap: { width: maxWidth }
        })
    }

    createOverlay(): Promise<void> {
        return new Promise((resolve) => {
            this.scene.launch(SceneKeys.OverlayingUI)
            this.scene.moveBelow(SceneKeys.OverlayingUI)
            const overlayingUI = this.game.scene.getScene(SceneKeys.OverlayingUI) as OverlayUI
            overlayingUI.setOverlappingScene(SceneKeys.Credits)

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