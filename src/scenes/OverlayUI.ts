import ImageButton from "@/classes/ui/ImageButton"
import SceneController, { SceneKeys } from "./SceneController"

export default class OverlayUI extends Phaser.Scene {
    private overlappingScene: SceneKeys | undefined

    preload() {
        this.load.svg('back-button', 'assets/ui/back.svg', {width: 80, height: 80})
    }

    create() {
        this.add.existing(new ImageButton(this, 80, 80, 'back-button', () => {
            const controller = this.game.scene.getScene(SceneKeys.SceneController) as SceneController

            if (!controller) {
                throw new Error('SceneController not found')
            }

            if (this.overlappingScene === undefined) {
                throw new Error('Overlapping scene not set')
            }

            controller.transitionTo(this.overlappingScene, SceneKeys.MainMenu)
        })).setAlpha(0.5)
    }

    setOverlappingScene(scene: SceneKeys) {
        this.overlappingScene = scene
    }
}