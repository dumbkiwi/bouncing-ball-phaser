import Spawner, { Direction, SpawnerState } from '@/classes/blob/Spawner'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'

import Vector2 = Phaser.Math.Vector2
import TextButton from '@/classes/ui/TextButton'
import SceneController, { SceneKeys } from '../SceneController'
import { getPlayerData } from '@/classes/player/PlayerContext'

const DEFAULT_SPACING = 30
const DEFAULT_DISTANCE = 200

const REST: SpawnerState = {
    spacing: {
        [Direction.TOP]: DEFAULT_SPACING,
        [Direction.DOWN]: DEFAULT_SPACING,
        [Direction.LEFT]: DEFAULT_SPACING,
        [Direction.RIGHT]: DEFAULT_SPACING,
        [Direction.TOP_LEFT]: DEFAULT_SPACING,
        [Direction.TOP_RIGHT]: DEFAULT_SPACING,
        [Direction.DOWN_LEFT]: DEFAULT_SPACING,
        [Direction.DOWN_RIGHT]: DEFAULT_SPACING,
    },
    distance: {
        [Direction.TOP]: DEFAULT_DISTANCE,
        [Direction.DOWN]: DEFAULT_DISTANCE,
        [Direction.LEFT]: DEFAULT_DISTANCE,
        [Direction.RIGHT]: DEFAULT_DISTANCE,
        [Direction.TOP_LEFT]: DEFAULT_DISTANCE,
        [Direction.TOP_RIGHT]: DEFAULT_DISTANCE,
        [Direction.DOWN_LEFT]: DEFAULT_DISTANCE,
        [Direction.DOWN_RIGHT]: DEFAULT_DISTANCE,
    },
}

const EXCITED: SpawnerState = {
    spacing: {
        [Direction.TOP]: DEFAULT_SPACING / 2,
        [Direction.DOWN]: DEFAULT_SPACING / 2,
        [Direction.LEFT]: DEFAULT_SPACING / 2,
        [Direction.RIGHT]: DEFAULT_SPACING / 2,
        [Direction.TOP_LEFT]: DEFAULT_SPACING / 2,
        [Direction.TOP_RIGHT]: DEFAULT_SPACING / 2,
        [Direction.DOWN_LEFT]: DEFAULT_SPACING / 2,
        [Direction.DOWN_RIGHT]: DEFAULT_SPACING / 2,
    },
    distance: {
        [Direction.TOP]: DEFAULT_DISTANCE / 2,
        [Direction.DOWN]: DEFAULT_DISTANCE / 2,
        [Direction.LEFT]: DEFAULT_DISTANCE / 2,
        [Direction.RIGHT]: DEFAULT_DISTANCE / 2,
        [Direction.TOP_LEFT]: DEFAULT_DISTANCE * 2,
        [Direction.TOP_RIGHT]: DEFAULT_DISTANCE * 2,
        [Direction.DOWN_LEFT]: DEFAULT_DISTANCE * 2,
        [Direction.DOWN_RIGHT]: DEFAULT_DISTANCE * 2,
    },
}

const FOCUSED: SpawnerState = {
    spacing: {
        [Direction.TOP]: 0,
        [Direction.DOWN]: 0,
        [Direction.LEFT]: 0,
        [Direction.RIGHT]: 0,
        [Direction.TOP_LEFT]: 0,
        [Direction.TOP_RIGHT]: 0,
        [Direction.DOWN_LEFT]: 0,
        [Direction.DOWN_RIGHT]: 0,
    },
    distance: {
        [Direction.TOP]: DEFAULT_DISTANCE * 1.5,
        [Direction.DOWN]: DEFAULT_DISTANCE * 1.5,
        [Direction.LEFT]: DEFAULT_DISTANCE / 3,
        [Direction.RIGHT]: DEFAULT_DISTANCE / 3,
        [Direction.TOP_LEFT]: DEFAULT_DISTANCE,
        [Direction.TOP_RIGHT]: DEFAULT_DISTANCE,
        [Direction.DOWN_LEFT]: DEFAULT_DISTANCE,
        [Direction.DOWN_RIGHT]: DEFAULT_DISTANCE,
    },
}

const ANGRY: SpawnerState = {
    spacing: {
        [Direction.TOP]: DEFAULT_SPACING * 10,
        [Direction.DOWN]: DEFAULT_SPACING * 10,
        [Direction.LEFT]: DEFAULT_SPACING * 10,
        [Direction.RIGHT]: DEFAULT_SPACING * 10,
        [Direction.TOP_LEFT]: DEFAULT_SPACING * 10,
        [Direction.TOP_RIGHT]: DEFAULT_SPACING * 10,
        [Direction.DOWN_LEFT]: DEFAULT_SPACING * 10,
        [Direction.DOWN_RIGHT]: DEFAULT_SPACING * 10,
    },
    distance: {
        [Direction.TOP]: DEFAULT_DISTANCE / 2,
        [Direction.DOWN]: DEFAULT_DISTANCE / 2,
        [Direction.LEFT]: DEFAULT_DISTANCE / 2,
        [Direction.RIGHT]: DEFAULT_DISTANCE / 2,
        [Direction.TOP_LEFT]: DEFAULT_DISTANCE / 2,
        [Direction.TOP_RIGHT]: DEFAULT_DISTANCE / 2,
        [Direction.DOWN_LEFT]: DEFAULT_DISTANCE / 2,
        [Direction.DOWN_RIGHT]: DEFAULT_DISTANCE / 2,
    },
}

const SAD: SpawnerState = {
    spacing: {
        [Direction.TOP]: DEFAULT_SPACING * 10,
        [Direction.DOWN]: DEFAULT_SPACING * 10,
        [Direction.LEFT]: DEFAULT_SPACING * 10,
        [Direction.RIGHT]: DEFAULT_SPACING * 10,
        [Direction.TOP_LEFT]: 0,
        [Direction.TOP_RIGHT]: 0,
        [Direction.DOWN_LEFT]: 0,
        [Direction.DOWN_RIGHT]: 0,
    },
    distance: {
        [Direction.TOP]: DEFAULT_DISTANCE / 4,
        [Direction.DOWN]: DEFAULT_DISTANCE / 4,
        [Direction.LEFT]: DEFAULT_DISTANCE / 4,
        [Direction.RIGHT]: DEFAULT_DISTANCE / 4,
        [Direction.TOP_LEFT]: DEFAULT_DISTANCE,
        [Direction.TOP_RIGHT]: DEFAULT_DISTANCE,
        [Direction.DOWN_LEFT]: DEFAULT_DISTANCE,
        [Direction.DOWN_RIGHT]: DEFAULT_DISTANCE,
    },
}

export default class MainMenu extends Phaser.Scene implements SceneWithOverlay {
    rexUI!: RexUIPlugin
    private avatar!: Spawner

    constructor() {
        super('MainMenu')
    }

    public create(): void {
        const playerData = getPlayerData(this)

        this.add
            .rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xffffff, 1)
            .setOrigin(0, 0)

        const logoX = this.cameras.main.centerX
        const logoY = 400
        const width = this.cameras.main.width

        const spawner = new Spawner(
            this,
            new Vector2(logoX, logoY),
            'title-logo',
            {
                eagerness: 0.001,
                damping: 0.5,
                anticipation: 2,
            },
            REST
        )

        this.add.existing(spawner)

        const logoSprite = this.add
            .sprite(logoX, logoY, `skins-${playerData.equippedSkin}`)
            .setScale(0.8)

        // spind the logo
        this.tweens.add({
            targets: logoSprite,
            angle: 360,
            duration: 10000,
            repeat: -1,
        })

        // pulse the logo's scale
        this.tweens.add({
            targets: logoSprite,
            scale: 1,
            duration: 10000,
            yoyo: true,
            ease: 'Sine.easeInOut',
            repeat: -1,
        })

        // anchor at the bottom of the screen
        const sizer = this.rexUI.add.sizer({
            orientation: 'y',
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY,
            width: width,
            anchor: {
                bottom: 'bottom',
            },
            space: {
                bottom: 100,
            },
        })

        this.createWindow(sizer)

        sizer.layout()

        this.avatar = spawner
    }

    private createWindow(sizer: RexUIPlugin.Sizer): RexUIPlugin.Sizer {
        const controller = this.game.scene.getScene(SceneKeys.SceneController) as SceneController
        if (!controller) {
            throw new Error('SceneController not found')
        }
        // play button
        const playButton = this.createMenuButton('Play', () => {
            controller.transitionTo(SceneKeys.MainMenu, SceneKeys.Game)
        }).setOrigin(0.5, 0.5)

        // skins button
        const skinsButton = this.createMenuButton('Skins', () => {
            controller.transitionTo(SceneKeys.MainMenu, SceneKeys.SkinSelection)
        }).setOrigin(0.5, 0.5)

        // settings button
        const settingsButton = this.createMenuButton('Settings', () => {
            controller.transitionTo(SceneKeys.MainMenu, SceneKeys.GameSettings)
        }).setOrigin(0.5, 0.5)

        // credits button
        const creditsButton = this.createMenuButton('Credits', () => {
            controller.transitionTo(SceneKeys.MainMenu, SceneKeys.Credits)
        }).setOrigin(0.5, 0.5)

        playButton.on('pointerover', () => {
            this.avatar.transitionTo(EXCITED)
        })

        playButton.on('pointerout', () => {
            this.avatar.transitionTo(REST)
        })

        skinsButton.on('pointerover', () => {
            this.avatar.transitionTo(ANGRY)
        })

        skinsButton.on('pointerout', () => {
            this.avatar.transitionTo(REST)
        })

        settingsButton.on('pointerover', () => {
            this.avatar.transitionTo(FOCUSED)
        })

        settingsButton.on('pointerout', () => {
            this.avatar.transitionTo(REST)
        })

        creditsButton.on('pointerover', () => {
            this.avatar.transitionTo(SAD)
        })

        creditsButton.on('pointerout', () => {
            this.avatar.transitionTo(REST)
        })

        sizer.add(playButton, 0, 'center', { top: 20, bottom: 20 })
        sizer.add(skinsButton, 0, 'center', { top: 20, bottom: 20 })
        sizer.add(settingsButton, 0, 'center', { top: 20, bottom: 20 })
        sizer.add(creditsButton, 0, 'center', { top: 20, bottom: 20 })

        return sizer
    }

    private createMenuButton(text: string, callback: () => void) {
        return this.add.existing(
            new TextButton(
                this,
                0,
                0,
                text,
                {
                    fontSize: 60,
                    fontStyle: 'bold',
                    fontFamily: 'Arial',
                    color: '#666666',
                },
                callback
            )
        )
    }

    createOverlay(): Promise<void> {
        // Do nothing cause we don't need an overlay yet
        return new Promise((resolve) => {
            resolve()
        })
    }

    removeOverlay(): void {
        // Do nothing cause we don't need an overlay yet
    }
}
