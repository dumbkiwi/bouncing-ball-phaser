type PlatformCondimentType = 'coin' | 'left-spike' | 'right-spike'

type CondimentPropability = {
    [key in PlatformCondimentType]: number
}
