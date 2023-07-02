import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'
import { SceneKeys } from '../SceneController'
import OverlayUI from '../overlays/OverlayUI'

export default class GameSettings extends Phaser.Scene implements SceneWithOverlay {
    rexUI!: RexUIPlugin

    createOverlay(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scene.launch(SceneKeys.OverlayingUI)
            this.scene.moveBelow(SceneKeys.OverlayingUI)
            const overlayingUI = this.game.scene.getScene(SceneKeys.OverlayingUI) as OverlayUI
            overlayingUI.setOverlappingScene(SceneKeys.GameSettings)

            this.game.scene.getScene(SceneKeys.OverlayingUI).load.on('complete', () => {
                resolve()
            })
        })
    }

    removeOverlay(): void {
        this.scene.sleep(SceneKeys.OverlayingUI)
        this.scene.setVisible(false, SceneKeys.OverlayingUI)
    }
}
