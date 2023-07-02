import { DEFAULT_SKIN } from "./skins"

const DEFAULT_PLAYER_DATA: PlayerData = {
    highScore: 0,
    coins: 0,
    ownedSkins: [DEFAULT_SKIN.id],
    equippedSkin: DEFAULT_SKIN.id,
    settings: {
        volume: 1,
    }
}

export default DEFAULT_PLAYER_DATA