const DIFFICULTY_RUBRICS: DifficultyRubrics = {
    0: {
        minGap: 400,
        maxGap: 400,
        minHeight: 900,
        maxHeight: 1000,
        minPlatformHeight: 20,
        maxPlatformHeight: 20,
        minPlatformWidth: 200,
        maxPlatformWidth: 200,
        requiredAcc: 0.8,
        platformColor: {
            baseColor: 0x666666,
            accurateColor: 0x88ff88,
            inaccurateColor: 0xffff00
        }
    },
    50: {
        minGap: 200,
        maxGap: 500,
        minHeight: 800,
        maxHeight: 1000,
        minPlatformHeight: 20,
        maxPlatformHeight: 20,
        minPlatformWidth: 180,
        maxPlatformWidth: 200,
        requiredAcc: 0.6,
        platformColor: {
            baseColor: 0x666666,
            accurateColor: 0x88ff88,
            inaccurateColor: 0xffff00
        }
    },
    75: {
        minGap: 200,
        maxGap: 500,
        minHeight: 900,
        maxHeight: 1100,
        minPlatformHeight: 20,
        maxPlatformHeight: 20,
        minPlatformWidth: 100,
        maxPlatformWidth: 180,
        requiredAcc: 0.5,
        platformColor: {
            baseColor: 0x666666,
            accurateColor: 0x88ff88,
            inaccurateColor: 0xffff00
        }
    },
    200: {
        minGap: 300,
        maxGap: 600,
        minHeight: 600,
        maxHeight: 800,
        minPlatformHeight: 20,
        maxPlatformHeight: 20,
        minPlatformWidth: 80,
        maxPlatformWidth: 100,
        requiredAcc: 0.4,
        platformColor: {
            baseColor: 0x666666,
            accurateColor: 0x88ff88,
            inaccurateColor: 0xffff00
        }
    },
    300: {
        minGap: 600,
        maxGap: 800,
        minHeight: 600,
        maxHeight: 800,
        minPlatformHeight: 20,
        maxPlatformHeight: 20,
        minPlatformWidth: 70,
        maxPlatformWidth: 80,
        requiredAcc: 0.4,
        platformColor: {
            baseColor: 0x666666,
            accurateColor: 0x88ff88,
            inaccurateColor: 0xffff00
        }
    }
}

export default DIFFICULTY_RUBRICS