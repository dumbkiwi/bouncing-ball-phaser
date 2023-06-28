import Loading from "./overlays/Loading"
import UI from "./overlays/GamePlayUI"
import MainMenu from "./menu-scenes/MainMenu"
import Gameplay from "./gameplay-scenes/Gameplay"
import Skins from "./menu-scenes/Skins"
import GameSettings from "./menu-scenes/GameSettings"
import Credits from "./menu-scenes/Credits"
import OverlayUI from "./overlays/OverlayUI"

export enum SceneKeys {
    SceneController = 'SceneController',
    Loading = 'Loading',
    MainMenu = 'MainMenu',
    SkinSelection = 'SkinSelection',
    GameSettings = 'GameSettings',
    Credits = 'Credits',
    Game = 'Game',
    GameUI = 'GameOver',
    OverlayingUI = 'OverlayingUI'
}

export default class SceneController extends Phaser.Scene {
    scene!: Phaser.Scenes.ScenePlugin

    constructor() {
        super('SceneController')
    }

    preload() {
        this.game.scene.add(SceneKeys.MainMenu, MainMenu, false)
        this.game.scene.add(SceneKeys.Game, Gameplay, false)
        this.game.scene.add(SceneKeys.GameUI, UI, false)
        this.game.scene.add(SceneKeys.SkinSelection, Skins, false)
        this.game.scene.add(SceneKeys.GameSettings, GameSettings, false)
        this.game.scene.add(SceneKeys.Credits, Credits, false)
        this.game.scene.add(SceneKeys.OverlayingUI,OverlayUI, false)
        this.game.scene.add(SceneKeys.Loading, Loading, true)
    }

    create() {
        this.game.scene.getScene(SceneKeys.Loading).load.once('complete', () => {
            this.transitionTo(undefined, SceneKeys.MainMenu)
        })
    }

    public transitionTo(from: SceneKeys | undefined, to: SceneKeys) {
        // show loading screen
        // wait for the other screen to finish preloading
        // transition to the other screen
        const loadingScene = this.game.scene.getScene(SceneKeys.Loading) as SceneWithTransition
        const nextScene = this.game.scene.getScene(to) as SceneWithOverlay

        if (this.scene.key === SceneKeys.Loading) {
            console.warn('Already in loading screen')
            return
        }

        if (from === to) {
            console.warn('Already in this scene')
            return
        }

        if (from === SceneKeys.Loading) {
            console.warn('Cannot transition from loading screen')
            return
        }
        
        this.scene.bringToTop(SceneKeys.Loading)
        loadingScene.transitionIn().then(() => {
            // stop current scene
            if (from) {
                const currentScene = this.game.scene.getScene(from) as SceneWithOverlay
                currentScene.removeOverlay()
                
                this.scene.sleep(from)
                this.scene.setVisible(false, from)
            }

            
            // start next scene
            this.scene.launch(to)

            nextScene.load.once('complete', () => {
                nextScene.createOverlay().then(() => {
                    loadingScene.transitionOut()
                })
            })
        })

        
        loadingScene.events.on('transitioncomplete', () => {
            nextScene.load.once('complete', () => {
                this.scene.transition({
                    target: to,
                    duration: 1000,
                    sleep: true,
                    allowInput: false,
                    moveBelow: true,
                })
            })
        })
    }
}