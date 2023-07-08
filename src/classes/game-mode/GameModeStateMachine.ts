import { BEATMAP_REGISTRY_ENTRY } from "@/constants/beatmaps"
import DIFFICULTY_RUBRICS from "@/constants/difficultyRubrics"

export class EndlessMode implements GameMode {
    constructor(scene: Phaser.Scene) {
        scene.registry.set(BEATMAP_REGISTRY_ENTRY, null)
    }

    getRubrics(): DifficultyManager.Rubrics {
        return DIFFICULTY_RUBRICS
    }
}

export class BeatmapMode implements GameMode {
    private parsedBeatmap: DifficultyManager.Rubrics
    constructor(scene: Phaser.Scene, beatmap: Beatmap) {

        scene.registry.set(BEATMAP_REGISTRY_ENTRY, beatmap)

        this.parsedBeatmap = this.createRubrics(scene, beatmap)
    }

    getRubrics(): DifficultyManager.Rubrics {
        return this.parsedBeatmap
    }

    private createRubrics(scene: Phaser.Scene, beatmap: Beatmap): DifficultyManager.Rubrics {
        // read beatmap from tilemap
        const tilemap = scene.make.tilemap({key: beatmap.key})

        // get objects layer
        const objectLayer = tilemap.getObjectLayer('objects')
        if (!objectLayer) {
            throw new Error('No objects layer found in beatmap')
        }

        // const rubrics = {}
        objectLayer.objects.forEach(object => {
            console.log(object)
        })

        return DIFFICULTY_RUBRICS
    }
}

export default class GameModeStateMachine implements GameModeContext {
    private mode: GameMode

    constructor(initialState: GameMode) {
        this.mode = initialState
    }

    getMode(): GameMode {
        return this.mode
    }

    changeState(state: GameMode): GameMode {
        this.mode = state
        return state
    }

    getRubrics(): DifficultyManager.Rubrics {
        return this.mode.getRubrics()
    }
}