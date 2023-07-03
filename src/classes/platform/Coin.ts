import Player from '../player/Player'
import { SetPlayerDataAction, getPlayerData, setPlayerData } from '../player/PlayerContext'
import { playCoinPickup } from '../sound-manager/SoundManager'
import Platform from './Platform'
import PlatformCondiment from './PlatformCondiment'

export default class Coin extends PlatformCondiment {
    private platform: Platform | undefined

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame)

        this.setScale(2)
    }

    public attachToPlatform(platform: Platform): void {
        this.platform = platform
        this.scene.events.on('postupdate', this.followPlatform, this)
    }

    public detachFromPlatform(): void {
        this.platform = undefined
        this.scene.events.off('postupdate', this.followPlatform, this)
    }

    public onCollisionWithPlayer(
        player: Player,
        isAccurateHit: boolean,
        _isLeftSide: boolean
    ): void {
        if (isAccurateHit) {
            // play audio
            playCoinPickup(this.scene)

            setPlayerData(this.scene, {
                type: SetPlayerDataAction.SET_COINS,
                payload: getPlayerData(this.scene).coins + 1,
            })

            this.disableBody(true, true)
        }
    }

    private followPlatform(): void {
        if (this.platform) {
            Phaser.Display.Align.To.TopCenter(this, this.platform)
        } else {
            throw new Error('Coin is not attached to a platform')
        }
    }
}
