import Player from '../player/Player'
import Platform from './Platform'
import Spike from './Spike'

export default class LeftSpike extends Spike {
    protected alignToPlatform(platform: Platform): void {
        const x = platform.x - (platform.getConfig()?.width ?? 0) / 2 + this.width / 2
        const y = platform.y - (platform.getConfig()?.height ?? 0)
        this.setPosition(x, y)
    }

    public onCollisionWithPlayer(
        player: Player,
        isAccurateHit: boolean,
        isLeftSide: boolean
    ): void {
        if (!isAccurateHit && isLeftSide) {
            player.applyGameOver()
        }
    }
}
