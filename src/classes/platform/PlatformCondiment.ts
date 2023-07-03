import Player from '../player/Player'
import Platform from './Platform'

export default class PlatformCondiment extends Phaser.Physics.Arcade.Sprite {
    public attachToPlatform(platform: Platform): void {
        //
    }
    public detachFromPlatform(): void {
        //
    }
    public onCollisionWithPlayer(
        player: Player,
        isAccurateHit: boolean,
        isLeftSide: boolean
    ): void {
        //
    }
}
