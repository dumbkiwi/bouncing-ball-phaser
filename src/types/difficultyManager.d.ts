namespace DifficultyManager {
    enum WatchType {
        SCORE,
        COUNT,
    }
    
    type Config = {
        watch: DifficultyManager.WatchType
    }
    
    type Rubrics = {
        0: PlatformSpawnerConfig,
        [key: number]: Partial<PlatformSpawnerConfig>
    }
}
