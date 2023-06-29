type PlatformColorConfig = {
    baseColor: number
    accurateColor: number
    inaccurateColor: number
}

type PlatformSpawnerConfig = {
    minGap: number
    maxGap: number
    minHeight: number
    maxHeight: number
    minPlatformHeight: number
    maxPlatformHeight: number
    minPlatformWidth: number
    maxPlatformWidth: number
    requiredAcc: number
    platformColor: PlatformColorConfig
}

type PlatformConfig = {
    width: number
    height: number
    extraWidth: number
    platformColor: PlatformColorConfig
}
