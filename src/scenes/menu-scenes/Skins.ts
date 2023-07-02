import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'
import { SceneKeys } from '../SceneController'
import OverlayUI from '../overlays/OverlayUI'
import Player from '@/classes/player/Player'
import SecondOrderDynamics from '@/classes/physics/SecondOrderDynamics'

import Vector2 = Phaser.Math.Vector2
import SKINS from '@/constants/skins'

export default class Skins extends Phaser.Scene implements SceneWithOverlay {
    rexUI!: RexUIPlugin

    private selectorManager!: SecondOrderDynamics

    private selector!: Phaser.GameObjects.Rectangle
    private skins!: {
        [id: string]: RexUIPlugin.Label
    }
    private coinText!: RexUIPlugin.Label

    private currentSkin!: number
    private ownedSkins!: number[]

    create() {
        const playerData = Player.loadPlayer()

        this.selectorManager = new SecondOrderDynamics(0.003, 0.5, 0, new Vector2())

        const selector = this.add.rectangle(0, 0, 160, 180, 0x666666, 0).setStrokeStyle(2, 0x666666)

        const sizer = this.rexUI.add.sizer({
            orientation: 'y',
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY,
            width: this.cameras.main.width - 150,
            height: 1200,
        })

        this.coinText = this.rexUI.add.label({
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY,
            anchor: {
                centerX: 'center',
                centerY: 'center',
            },
            text: this.add.text(0, 0, playerData.coins.toString(), {
                fontSize: '64px',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                color: '#666666',
            }).setOrigin(0.5),
            icon: this.add.image(0, 0, 'coin').setScale(3),
            space: {
                icon: 10,
            },
            align: 'center',
        })

        sizer.add(this.coinText, 0, 'center', {
            top: 20,
            bottom: 20,
        },
        true)

        this.skins = {} as {
            [id: string]: RexUIPlugin.Label
        }

        SKINS.forEach((skin) => {
            this.skins[skin.id] = this.createSkin(skin)
        })

        this.ownedSkins = playerData.ownedSkins

        this.ownedSkins.forEach((skinId) => {
            const skin = this.skins[skinId.toString()]

            const image = skin.getElement('icon') as Phaser.GameObjects.Image

            image.setTexture(`skins-${skinId}`)
        })

        // create gridtable
        const panel = this.rexUI.add.scrollablePanel({
            // x: this.cameras.main.centerX,
            // y: this.cameras.main.centerY + 80,
            scrollMode: 0,
            // width: this.cameras.main.width - 150,
            // height: 900,
            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, 2, 0, 0, 0x666666),
                thumb: this.rexUI.add.roundRectangle(0, 0, 8, 100, 5, 0x666666),
            },
            background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0x000000, 0).setStrokeStyle(2, 0x666666),
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
                child: this.createPanel(Object.values(this.skins)),
            },
        })

        sizer.add(panel, 1, 'center', {
            top: 20,
            bottom: 20,
        },
        true)

        
        this.currentSkin = playerData.equippedSkin
        
        panel.layout()
        panel.setChildrenInteractive({})
        panel.on('child.click', (child: RexUIPlugin.Label) => {
            const skinId = child.getData('skinId')
            
            if (skinId === this.currentSkin) {
                return
            }

            if (!this.ownedSkins.includes(skinId)) {
                const cost = SKINS[skinId].price
                
                const coins = this.loadPlayerCoins()

                if (coins < cost) {
                    return
                }

                this.savePlayerCoins(coins - cost)

                const image = child.getElement('icon') as Phaser.GameObjects.Image

                image.setTexture(`skins-${skinId}`)

                this.savePlayerOwnedSkins([...this.ownedSkins, skinId])
            }
            this.currentSkin = skinId
            
            this.savePlayerSkin(skinId)
        }, this)
        
        sizer.layout()
        this.selector = selector
    }

    update(_time: number, delta: number) {
        const currentSkinObj = this.skins[this.currentSkin.toString()]
        const targetPosition = new Vector2(currentSkinObj.x, currentSkinObj.y)
        const newPos = this.selectorManager.update(delta, targetPosition)
        this.selector.setPosition(newPos.x, newPos.y)
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

    private savePlayerCoins(coins: number) {
        const playerData = Player.loadPlayer()

        playerData.coins = coins

        localStorage.setItem('player', JSON.stringify(playerData))

        this.coinText.text = coins.toString()
    }

    private savePlayerOwnedSkins(ownedSkins: number[]) {
        const playerData = Player.loadPlayer()

        playerData.ownedSkins = ownedSkins

        localStorage.setItem('player', JSON.stringify(playerData))

        this.ownedSkins = ownedSkins
    }

    private loadPlayerCoins(): number {
        const playerData = Player.loadPlayer()
        
        return playerData.coins
    }

    private savePlayerSkin(skin: number) {
        const playerData = Player.loadPlayer()

        playerData.equippedSkin = skin

        localStorage.setItem('player', JSON.stringify(playerData))
    }

    private createPanel(skins: RexUIPlugin.Label[]) {
        const panel = this.rexUI.add.fixWidthSizer({
            space: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
                item: 20,
                line: 20
            },
            align: 'center'
        })


        skins.forEach((skin) => {
            panel.add(skin)
        })

        panel.layout()

        return panel
    }

    private createSkin(skin: SkinData) {
        const label = this.rexUI.add.label({
            orientation: 1,
            text: this.add.text(0, 0, skin.price.toString(), {
                fontSize: '24px',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                color: '#666666',
            }),
            icon: this.add.image(0, 0, 'skins-locked').setDisplaySize(130, 130),
            space: {
                icon: 5,
            },
            align: 'center',
        })

        label.setData('skinId', skin.id)

        return label
    }
}
