import Coin from "@/classes/platform/Coin"
import LeftSpike from "@/classes/platform/LeftSpike"
import RightSpike from "@/classes/platform/RightSpike"

const CONDIMENTS: {
    [key in PlatformCondimentType]: Function
} = {
    'left-spike': LeftSpike,
    'right-spike': RightSpike,
    'coin': Coin,
}

export default CONDIMENTS