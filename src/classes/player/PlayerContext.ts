import DEFAULT_PLAYER_DATA from "@/constants/playerData"

export enum SetPlayerDataAction {
    SAVE = 'SAVE',
    SET_HIGH_SCORE = 'SET_HIGH_SCORE',
    SET_COINS = 'SET_COINS',
    SET_EQUIPPED_SKIN = 'SET_EQUIPPED_SKIN',
    SET_OWNED_SKINS = 'SET_OWNED_SKINS',
    SET_SETTINGS = 'SET_SETTINGS',
}

export function registerPlayerData(scene: Phaser.Scene) {
    const playerData = loadPlayerDataFromLocalStorage()

    saveToRegistry(scene, playerData)
}

export function getPlayerData(scene: Phaser.Scene): PlayerData {
    const player = scene.registry.get('player') as PlayerData

    if (!player) {
        throw new Error('Player data not found in registry')
    }

    return player
}

export function setPlayerData(scene: Phaser.Scene, action: {
    type: SetPlayerDataAction,
    payload?: number | number[] | {volume: number},
    saveImmediately?: boolean
}) {
    const player = getPlayerData(scene)
    let save = action.saveImmediately ?? false

    switch (action.type) {
        case SetPlayerDataAction.SAVE:
            save = true
            break

        case SetPlayerDataAction.SET_HIGH_SCORE:
            if (!isNotNullOrUndefined(action.payload) || typeof action.payload !== 'number') {
                throw new Error('Invalid payload for SET_HIGH_SCORE action')
            }

            player.highScore = action.payload
            saveToRegistry(scene, player)

            break

        case SetPlayerDataAction.SET_COINS:
            if (!isNotNullOrUndefined(action.payload) || typeof action.payload !== 'number') {
                throw new Error('Invalid payload for SET_COINS action')
            }

            player.coins = action.payload
            saveToRegistry(scene, player)

            break

        case SetPlayerDataAction.SET_EQUIPPED_SKIN:
            if (!isNotNullOrUndefined(action.payload) || typeof action.payload !== 'number') {
                throw new Error('Invalid payload for SET_EQUIPPED_SKIN action')
            }

            player.equippedSkin = action.payload
            saveToRegistry(scene, player)

            break

        case SetPlayerDataAction.SET_OWNED_SKINS:
            if (!isNotNullOrUndefined(action.payload) || !Array.isArray(action.payload)) {
                throw new Error('Invalid payload for SET_OWNED_SKINS action')
            }

            player.ownedSkins = action.payload
            saveToRegistry(scene, player)

            break

        case SetPlayerDataAction.SET_SETTINGS:
            if (!isNotNullOrUndefined(action.payload) || typeof action.payload !== 'object') {
                throw new Error('Invalid payload for SET_SETTINGS action')
            }

            player.settings = {
                ...player.settings,
                ...action.payload
            }

            saveToRegistry(scene, player)

            break

        default:
            break
    }

    if (save) {
        saveToFile(player)
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function oncePlayerDataChange(scene: Phaser.Scene, callback: (player: PlayerData) => void, context?: any) {
    scene.registry.events.once('changedata', (parent: Phaser.Data.DataManager, key: string, data: PlayerData) => {
        if (key === 'player') {
            callback(data)
        }
    }, context)
}

export function offPlayerDataChange(scene: Phaser.Scene, callback: (player: PlayerData) => void) {
    scene.registry.events.off('changedata', (parent: Phaser.Data.DataManager, key: string, data: PlayerData) => {
        if (key === 'player') {
            callback(data)
        }
    })
    
}

function saveToFile(player: PlayerData) {
    localStorage.setItem('player', JSON.stringify(player))
}

function saveToRegistry(scene: Phaser.Scene, player: PlayerData) {
    scene.registry.set('player', player)
}

function loadPlayerDataFromLocalStorage(): PlayerData {
    const playerData = localStorage.getItem('player')
    
    if (playerData) {
        const parsedData = JSON.parse(playerData)

        if (parsedData satisfies PlayerData) {
            return parsedData
        }
    }

    return DEFAULT_PLAYER_DATA
}

function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined
}
