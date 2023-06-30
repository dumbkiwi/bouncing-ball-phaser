import Player from "../player/Player"
import Platform from "./Platform"
import PlatformCondiment from "./PlatformCondiment"

export default abstract class Spike extends PlatformCondiment {
    private platform: Platform | undefined

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture)

        this.setScale(0.6, 1)
        this.setOrigin(0.2, 0.5)
    }
    
    public attachToPlatform(platform: Platform): void {
        this.platform = platform
        this.scene.events.on('postupdate', this.followPlatform, this)
    }

    public detachFromPlatform(): void {
        this.scene.events.off('postupdate', this.followPlatform, this)
    }

    public abstract onCollisionWithPlayer(player: Player, isAccurateHit: boolean, isLeftSide: boolean): void

    private followPlatform(): void {
        if (this.platform) {
            this.alignToPlatform(this.platform)
        } else {
            throw new Error('Spike is not attached to a platform')
        }
    }
    
    protected abstract alignToPlatform(platform: Platform): void
}