import Phaser from 'phaser'
import type { Types } from "phaser"
import Gameplay from './scenes/Gameplay'

const SCALE_OPTS = {
    mode: Phaser.Scale.ScaleModes.FIT,
    parent: 'game',
    width: 1280, // 16x9
    height: 720,
}

const GAME_CONFIG: Types.Core.GameConfig = {
    title: 'Bouncing Ball',
    type: Phaser.WEBGL,
    backgroundColor: '#000000',
    scale: SCALE_OPTS,
    scene: Gameplay,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const game = new Phaser.Game(GAME_CONFIG)