import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'
import { SceneKeys } from '../SceneController'
import OverlayUI from '../overlays/OverlayUI'
import SecondOrderDynamics from '@/classes/physics/SecondOrderDynamics'

import Vector2 = Phaser.Math.Vector2
import SKINS from '@/constants/skins'
import {
    SetPlayerDataAction,
    getPlayerData,
    oncePlayerDataChange,
    setPlayerData,
} from '@/classes/player/PlayerContext'

export default class Skins extends Phaser.Scene implements SceneWithOverlay {
    rexUI!: RexUIPlugin

    private indicatorManager!: SecondOrderDynamics
    private coins!: number

    private indicator!: Phaser.GameObjects.Rectangle
    private skinLabels!: {
        [id: string]: RexUIPlugin.Label
    }
    private coinText!: RexUIPlugin.Label

    private currentSkin!: number
    private ownedSkins!: number[]

    create() {
        const playerData = getPlayerData(this)

        // sizer to hold all elements
        const sizer = this.rexUI.add.sizer({
            orientation: 'y',
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY,
            width: this.cameras.main.width - 150,
            height: 1200,
        })

        // create indicator
        this.createIndicator()

        // initiate skins
        this.ownedSkins = playerData.ownedSkins
        this.currentSkin = playerData.equippedSkin
        this.skinLabels = this.createSkinLabels()

        // create coin text
        this.coins = playerData.coins
        this.coinText = this.createCoinText(playerData.coins.toString())
        sizer.add(
            this.coinText,
            0,
            'center',
            {
                top: 20,
                bottom: 20,
            },
            true
        )

        // create skin table
        const panel = this.createSkinPanel()
        sizer.add(
            panel,
            1,
            'center',
            {
                top: 20,
                bottom: 20,
            },
            true
        )

        panel.setChildrenInteractive({})
        panel.on('child.click', this.onSkinSelection.bind(this))

        panel.layout()
        sizer.layout()

        // subscribe to player data changes
        oncePlayerDataChange(this, this.updateCoinsAmount.bind(this))
    }

    update(_time: number, delta: number) {
        const currentSkinObj = this.skinLabels[this.currentSkin.toString()]
        const targetPosition = new Vector2(currentSkinObj.x, currentSkinObj.y)
        const newPos = this.indicatorManager.update(delta, targetPosition)
        this.indicator.setPosition(newPos.x, newPos.y)
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

    private updateCoinsAmount(playerData: PlayerData) {
        this.coins = playerData.coins
        this.coinText.setText(this.coins.toString())

        // resubscribe to player data changes
        oncePlayerDataChange(this, this.updateCoinsAmount.bind(this))
    }

    private createIndicator() {
        // indicator
        this.indicatorManager = new SecondOrderDynamics(0.003, 0.5, 0, new Vector2())
        this.indicator = this.add.rectangle(0, 0, 160, 180, 0x666666, 0).setStrokeStyle(2, 0x666666)
    }

    private createCoinText(coins: string) {
        return this.rexUI.add.label({
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY,
            anchor: {
                centerX: 'center',
                centerY: 'center',
            },
            text: this.add
                .text(0, 0, coins, {
                    fontSize: '64px',
                    fontFamily: 'Arial',
                    fontStyle: 'bold',
                    color: '#666666',
                })
                .setOrigin(0.5),
            icon: this.add.image(0, 0, 'coin').setScale(3),
            space: {
                icon: 10,
            },
            align: 'center',
        })
    }

    private createSkinPanel() {
        const panel = this.rexUI.add.scrollablePanel({
            scrollMode: 0,
            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, 2, 0, 0, 0x666666),
                thumb: this.rexUI.add.roundRectangle(0, 0, 8, 100, 5, 0x666666),
            },
            background: this.rexUI.add
                .roundRectangle(0, 0, 2, 2, 10, 0x000000, 0)
                .setStrokeStyle(2, 0x666666),
            mouseWheelScroller: {
                focus: false,
                speed: 0.5,
            },
            space: {
                left: 40,
                right: 40,
                top: 40,
                bottom: 40,
            },
            panel: {
                child: this.createPanel(Object.values(this.skinLabels)),
            },
        })

        return panel
    }

    private createSkinLabels() {
        const labels = {} as {
            [id: string]: RexUIPlugin.Label
        }

        SKINS.forEach((skin) => {
            labels[skin.id] = this.createSkin(skin)
        })

        return labels
    }

    private createPanel(skins: RexUIPlugin.Label[]) {
        const panel = this.rexUI.add.fixWidthSizer({
            space: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
                item: 20,
                line: 20,
            },
            align: 'center',
        })

        skins.forEach((skin) => {
            panel.add(skin)
        })

        panel.layout()

        return panel
    }

    private createSkin(skin: SkinData) {
        const owned = this.ownedSkins.includes(skin.id)

        const label = this.rexUI.add.label({
            orientation: 1,
            text: this.add.text(0, 0, skin.price.toString(), {
                fontSize: '24px',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                color: '#666666',
            }),
            icon: this.add
                .image(0, 0, owned ? `skins-${skin.id}` : 'skins-locked')
                .setDisplaySize(130, 130),
            space: {
                icon: 5,
            },
            align: 'center',
        })

        label.setData('skinId', skin.id)

        return label
    }

    private onSkinSelection(label: RexUIPlugin.Label) {
        const skinId = label.getData('skinId')

        if (skinId === this.currentSkin) {
            return
        }

        if (!this.ownedSkins.includes(skinId)) {
            const cost = SKINS[skinId].price

            if (this.coins < cost) {
                return
            }

            const image = label.getElement('icon') as Phaser.GameObjects.Image
            image.setTexture(`skins-${skinId}`)

            setPlayerData(this, {
                type: SetPlayerDataAction.SET_COINS,
                payload: this.coins - cost,
            })

            setPlayerData(this, {
                type: SetPlayerDataAction.SET_OWNED_SKINS,
                payload: [...this.ownedSkins, skinId],
            })

            this.ownedSkins.push(skinId)
        }

        this.currentSkin = skinId

        setPlayerData(this, {
            type: SetPlayerDataAction.SET_EQUIPPED_SKIN,
            payload: skinId,
        })

        setPlayerData(this, {
            type: SetPlayerDataAction.SAVE,
        })
    }
}
