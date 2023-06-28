import Loading from "./Loading"
import UI from "./GamePlayUI"
import MainMenu from "./MainMenu"
import Gameplay from "./Gameplay"

export enum SceneKeys {
    SceneController = 'SceneController',
    Loading = 'Loading',
    MainMenu = 'MainMenu',
    Game = 'Game',
    UI = 'GameOver'
}

export default class SceneController extends Phaser.Scene {
    scene!: Phaser.Scenes.ScenePlugin

    constructor() {
        super('SceneController')
    }

    preload() {
        this.game.scene.add(SceneKeys.MainMenu, MainMenu, false)
        this.game.scene.add(SceneKeys.Game, Gameplay, false)
        this.game.scene.add(SceneKeys.UI, UI, false)
        this.game.scene.add(SceneKeys.Loading, Loading, true)
    }

    create() {
        this.game.scene.getScene(SceneKeys.Loading).load.once('complete', () => {
            this.transitionTo(SceneKeys.Game)
        })
    }

    public transitionTo(sceneKey: SceneKeys) {
        // show loading screen
        // wait for the other screen to finish preloading
        // transition to the other screen
        const pastSceneKey = this.scene.key
        const loadingScene = this.game.scene.getScene(SceneKeys.Loading) as SceneWithTransition
        const nextScene = this.game.scene.getScene(sceneKey)

        if (this.scene.key === SceneKeys.Loading) {
            console.warn('Already in loading screen')
            return
        }
        
        this.scene.bringToTop(SceneKeys.Loading)
        loadingScene.transitionIn().then(() => {
            // stop current scene
            this.scene.stop(pastSceneKey)

            // start next scene
            this.scene.launch(sceneKey)

            nextScene.load.once('complete', () => {
                loadingScene.transitionOut()
            })
        })

        
        loadingScene.events.on('transitioncomplete', () => {
            nextScene.load.once('complete', () => {
                this.scene.transition({
                    target: sceneKey,
                    duration: 1000,
                    sleep: true,
                    allowInput: false,
                    moveBelow: true,
                })
            })
        })
    }
}