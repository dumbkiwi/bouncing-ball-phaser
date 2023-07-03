import Phaser from 'phaser'
import type { Types } from 'phaser'
import SceneController from './scenes/SceneController'
// import PlatformTestScene from './scenes/PlatformTestScene'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

const SCALE_OPTS = {
    mode: Phaser.Scale.ScaleModes.FIT,
    parent: 'game',
    width: 720, // 16x9
    height: 1280,
}

const GAME_CONFIG: Types.Core.GameConfig = {
    title: 'Bouncing Ball',
    type: Phaser.WEBGL,
    audio: {
        context: new AudioContext(),
    },
    plugins: {
        scene: [
            {
                key: 'rexUI',
                plugin: RexUIPlugin,
                mapping: 'rexUI',
            },
        ],
    },
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true,
            gravity: { y: 1000 },
        },
    },
    backgroundColor: '#ffffff',
    scale: SCALE_OPTS,
    scene: SceneController,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const game = new Phaser.Game(GAME_CONFIG)
