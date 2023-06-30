import Player from "../player/Player"
import Platform from "./Platform"

export default abstract class PlatformCondiment extends Phaser.Physics.Arcade.Sprite {
    public abstract attachToPlatform(platform: Platform): void
    public abstract detachFromPlatform(): void
    public abstract onCollisionWithPlayer(player: Player, isAccurateHit: boolean, isLeftSide: boolean): void
}
