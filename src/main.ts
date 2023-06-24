import Phaser from 'phaser'
import type { Types } from "phaser"
import PlatformTestScene from './scenes/PlatformTestScene'

const SCALE_OPTS = {
    mode: Phaser.Scale.ScaleModes.FIT,
    parent: 'game',
    width: 720, // 16x9
    height: 1280,
}

const GAME_CONFIG: Types.Core.GameConfig = {
    title: 'Bouncing Ball',
    type: Phaser.WEBGL,
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true,
            gravity: { y: 600 },
        }
    },
    backgroundColor: '#ffffff',
    scale: SCALE_OPTS,
    scene: PlatformTestScene,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const game = new Phaser.Game(GAME_CONFIG)