import Player from "../player/Player"
import Platform from "./Platform"
import PlatformCondiment from "./PlatformCondiment"

export default class Coin extends PlatformCondiment {
    private platform: Platform | undefined

    public attachToPlatform(platform: Platform): void {
        this.platform = platform
        this.scene.events.on('postupdate', this.followPlatform, this)
    }
    
    public detachFromPlatform(): void {
        this.scene.events.off('postupdate', this.followPlatform, this)
    }
    
    public onCollisionWithPlayer(player: Player, isAccurateHit: boolean, isLeftSide: boolean): void {
        if (!isAccurateHit) {
            player.getScoreManager().addCoin()
        }

        this.disableBody(true, true)
    }

    private followPlatform(): void {
        if (this.platform) {
            Phaser.Display.Align.To.TopCenter(this, this.platform)
        } else {
            throw new Error('Coin is not attached to a platform')
        }
    }
    
}