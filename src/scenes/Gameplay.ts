import Vector2 = Phaser.Math.Vector2
import Spawner, { Direction, SpawnerState } from '@/classes/Spawner'

const DEFAULT_SPACING = 25
const DEFAULT_DISTANCE = 150

const DEFAULT_SPAWNER_STATE: SpawnerState = {
    spacing: {
        [Direction.TOP]: DEFAULT_SPACING,
        [Direction.DOWN]: DEFAULT_SPACING,
        [Direction.LEFT]: DEFAULT_SPACING,
        [Direction.RIGHT]: DEFAULT_SPACING,
        [Direction.TOP_LEFT]: DEFAULT_SPACING,
        [Direction.TOP_RIGHT]: DEFAULT_SPACING,
        [Direction.DOWN_LEFT]: DEFAULT_SPACING,
        [Direction.DOWN_RIGHT]: DEFAULT_SPACING,
    },
    distance: {
        [Direction.TOP]: DEFAULT_DISTANCE,
        [Direction.DOWN]: DEFAULT_DISTANCE,
        [Direction.LEFT]: DEFAULT_DISTANCE,
        [Direction.RIGHT]: DEFAULT_DISTANCE,
        [Direction.TOP_LEFT]: DEFAULT_DISTANCE,
        [Direction.TOP_RIGHT]: DEFAULT_DISTANCE,
        [Direction.DOWN_LEFT]: DEFAULT_DISTANCE,
        [Direction.DOWN_RIGHT]: DEFAULT_DISTANCE,
    },
}

const SECONDARY_SPAWNER_STATE: SpawnerState = {
    spacing: {
        [Direction.TOP]: DEFAULT_SPACING,
        [Direction.DOWN]: DEFAULT_SPACING,
        [Direction.LEFT]: DEFAULT_SPACING,
        [Direction.RIGHT]: DEFAULT_SPACING,
        [Direction.TOP_LEFT]: 0.5,
        [Direction.TOP_RIGHT]: 0.5,
        [Direction.DOWN_LEFT]: 0.5,
        [Direction.DOWN_RIGHT]: 0.5,
    },
    distance: {
        [Direction.TOP]: DEFAULT_DISTANCE * 1.5,
        [Direction.DOWN]: DEFAULT_DISTANCE * 1.5,
        [Direction.LEFT]: DEFAULT_DISTANCE / 2,
        [Direction.RIGHT]: DEFAULT_DISTANCE / 2,
        [Direction.TOP_LEFT]: DEFAULT_DISTANCE / 1.5,
        [Direction.TOP_RIGHT]: DEFAULT_DISTANCE / 1.5,
        [Direction.DOWN_LEFT]: DEFAULT_DISTANCE / 1.5,
        [Direction.DOWN_RIGHT]: DEFAULT_DISTANCE / 1.5,
    },
}

export default class Gameplay extends Phaser.Scene {
    preload() {
        this.load.image('pearl', 'assets/bouncing-ball/1x/pearl_purple.png')
    }
    create() {
        const spawner = new Spawner(
            this,
            new Vector2(1100, 500),
            {
                eagerness: 0.001,
                damping: 0.5,
                anticipation: 2,
            },
            DEFAULT_SPAWNER_STATE
        )

        const group = this.add.group(spawner, {
            runChildUpdate: true,
        })

        const button1 = this.add.container(100, 100, [
            this.add.circle(0, 0, 50, 0x9b7df8, 1).setStrokeStyle(2, 0x000000, 1),
            this.add
                .text(0, 0, '1', { fontSize: '32px', color: '#ffffff', fontFamily: 'Consolas' })
                .setOrigin(0.5, 0.5),
        ])

        button1.setSize(100, 100)
        button1.setInteractive()

        const button2 = this.add.container(300, 100, [
            this.add.circle(0, 0, 50, 0x9b7df8, 1).setStrokeStyle(2, 0x000000, 1),
            this.add
                .text(0, 0, '2', { fontSize: '32px', color: '#ffffff', fontFamily: 'Consolas' })
                .setOrigin(0.5, 0.5),
        ])

        button2.setSize(100, 100)
        button2.setInteractive()

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // checks if the pointer in on top of the button
            if (button1.getBounds().contains(pointer.x, pointer.y)) {
                spawner.transitionTo(SECONDARY_SPAWNER_STATE)
                button1.setScale(0.8)
            }

            if (button2.getBounds().contains(pointer.x, pointer.y)) {
                spawner.transitionTo(DEFAULT_SPAWNER_STATE)
                button2.setScale(0.8)
            }
        })

        this.input.on('pointerup', () => {
            button1.setScale(1)
            button2.setScale(1)
        })
    }
}
