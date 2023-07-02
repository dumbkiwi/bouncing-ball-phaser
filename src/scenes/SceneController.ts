import Loading from './overlays/Loading'
import UI from './overlays/GameplayUI'
import MainMenu from './menu-scenes/MainMenu'
import Gameplay from './gameplay-scenes/Gameplay'
import Skins from './menu-scenes/Skins'
import GameSettings from './menu-scenes/GameSettings'
import Credits from './menu-scenes/Credits'
import OverlayUI from './overlays/OverlayUI'

import SKINS from '@/constants/skins'
import { registerPlayerData } from '@/classes/player/PlayerContext'

export enum SceneKeys {
    // scenes
    Credits = 'Credits',
    Game = 'Game',
    GameSettings = 'GameSettings',
    MainMenu = 'MainMenu',
    SceneController = 'SceneController',
    SkinSelection = 'SkinSelection',

    // overlays
    GameUI = 'GameOver',
    Loading = 'Loading',
    OverlayingUI = 'OverlayingUI',
}

export default class SceneController extends Phaser.Scene {
    scene!: Phaser.Scenes.ScenePlugin

    constructor() {
        super('SceneController')
    }

    preload() {
        // scenes
        this.game.scene.add(SceneKeys.Credits, Credits, false)
        this.game.scene.add(SceneKeys.Game, Gameplay, false)
        this.game.scene.add(SceneKeys.MainMenu, MainMenu, false)
        this.game.scene.add(SceneKeys.GameSettings, GameSettings, false)
        this.game.scene.add(SceneKeys.SkinSelection, Skins, false)

        // overlays
        this.game.scene.add(SceneKeys.GameUI, UI, false)
        this.game.scene.add(SceneKeys.OverlayingUI, OverlayUI, false)
        const loadingScene = this.game.scene.add(SceneKeys.Loading, Loading, true)

        loadingScene?.events.once('create', () => {
            this.transitionTo(undefined, SceneKeys.MainMenu)
        })

        // skins
        SKINS.forEach((skin) => {
            this.load.image(`skins-${skin.id}`, skin.url)
        })

        this.load.image('skins-locked', 'assets/bouncing-ball/1x/locked.png')
        this.load.image('coin' as PlatformCondimentType, 'assets/items/diamond.png')
    }

    create() {
        // register player data to registry
        registerPlayerData(this)
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

            nextScene.events.once('ready', () => {
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

    public reloadScene(from: SceneKeys) {
        // show loading screen
        // wait for the other screen to finish preloading
        // transition to the other screen
        const loadingScene = this.game.scene.getScene(SceneKeys.Loading) as SceneWithTransition

        if (this.scene.key === SceneKeys.Loading) {
            console.warn('Already in loading screen')
            return
        }

        if (from === SceneKeys.Loading) {
            console.warn('Cannot transition from loading screen')
            return
        }

        this.scene.bringToTop(SceneKeys.Loading)
        loadingScene.transitionIn().then(() => {
            // restart current scene
            const currentScene = this.game.scene.getScene(from) as SceneWithOverlay
            currentScene.removeOverlay()

            currentScene.scene.restart()

            currentScene.load.once('complete', () => {
                currentScene.createOverlay().then(() => {
                    loadingScene.transitionOut()
                })
            })
        })
    }
}
