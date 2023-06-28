import Phaser from 'phaser'
import Vector2 = Phaser.Math.Vector2
import CubicBezier = Phaser.Curves.CubicBezier
import Line = Phaser.Curves.Line
import { SecondOrderDynamicsScalar } from './SecondOrderDynamics'

export enum Direction {
    TOP,
    DOWN,
    LEFT,
    RIGHT,
    TOP_LEFT,
    TOP_RIGHT,
    DOWN_LEFT,
    DOWN_RIGHT,
}

export type Spines = {
    [key in Direction]: {
        t: number
        path: Phaser.Curves.Line
        handles: [Vector2, Vector2, Vector2]
        followerDistance: number
        followerSpacing: number
        distanceManager: SecondOrderDynamicsScalar
        spacingManager: SecondOrderDynamicsScalar
    }
}

export type BezierSpacing = {
    [key in Direction]: number
}

export type BezierDistance = {
    [key in Direction]: number
}

export type SpawnerState = {
    spacing: BezierSpacing
    distance: BezierDistance
}

const SQRT_2 = Math.sqrt(2)

const DEFAULT_DISTANCE = 200
const DEFAULT_SPACING = 50
const DEFAULT_TWEEN_DURATION = 1000
const DEFAULT_TWEEN_EASE = 'Sine.easeInOut'
const INITIAL_TWEEN_VALUE = 0.8

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

const DIRECTION_VECTOR: {
    [key in Direction]: Vector2
} = {
    [Direction.TOP]: new Vector2(0, -1),
    [Direction.DOWN]: new Vector2(0, 1),
    [Direction.LEFT]: new Vector2(-1, 0),
    [Direction.RIGHT]: new Vector2(1, 0),
    [Direction.TOP_LEFT]: new Vector2(-SQRT_2 / 2, -SQRT_2 / 2),
    [Direction.TOP_RIGHT]: new Vector2(SQRT_2 / 2, -SQRT_2 / 2),
    [Direction.DOWN_LEFT]: new Vector2(-SQRT_2 / 2, SQRT_2 / 2),
    [Direction.DOWN_RIGHT]: new Vector2(SQRT_2 / 2, SQRT_2 / 2),
}

/**
 * Generate an anchor and handles for a point in a bezier curve
 *
 * For D: distance, S: spacing
 *
 * Transformation matrix is:
 *
 * | D | S |
 *
 * | D | 0 |
 *
 * | D |-S |
 *
 * For direction = (A, B)
 *
 * The input matrix is:
 *
 * | A | B |
 *
 * | B |-A |
 *
 * And output for each row of the transform matrix:
 *
 * x = [A, B] * [D, S] = AD + BS
 *
 * y = [B, -A] * [D, 0] = BD
 *
 * @param direction Direction of the vector from the anchor to the origin
 * @param origin The origin of the bezier curve
 * @param spacing Space between the start and middle point in the perpendicular direction
 * @param distance Distance between the middle point and origin
 * @param start The left handle of the bezier curve, looking from the origin
 * @param middle The anchor point of the bezier curve
 * @param end The right handle of the bezier curve, looking from the origin
 */
function setBezierExtent(
    direction: Direction,
    origin: Vector2 = new Vector2(),
    spacing = 1,
    distance = 1,
    start: Vector2 = new Vector2(),
    middle: Vector2 = new Vector2(),
    end: Vector2 = new Vector2()
) {
    const directionVec = DIRECTION_VECTOR[direction]

    start.x = origin.x + directionVec.x * distance + directionVec.y * spacing
    start.y = origin.y + directionVec.y * distance - directionVec.x * spacing

    middle.x = origin.x + directionVec.x * distance
    middle.y = origin.y + directionVec.y * distance

    end.x = origin.x + directionVec.x * distance - directionVec.y * spacing
    end.y = origin.y + directionVec.y * distance + directionVec.x * spacing

    return [start, middle, end]
}

export default class Spawner extends Phaser.GameObjects.GameObject {
    private origin: Vector2
    private config: SpawnerInterpolationConfig
    private spines: Spines
    private tweeners: {
        [key in Direction]: Phaser.Tweens.Tween
    }

    private currentState: SpawnerState

    private path: Phaser.Curves.Path
    private graphics: Phaser.GameObjects.Graphics

    constructor(
        scene: Phaser.Scene,
        origin: Vector2,
        texture: string,
        interpolationConfig: SpawnerInterpolationConfig,
        state: SpawnerState = DEFAULT_SPAWNER_STATE
    ) {
        super(scene, 'Spawner')

        this.origin = origin
        this.config = interpolationConfig
        this.currentState = state

        const { distance: defaultDistance, spacing: defaultSpacing } = state

        // create()
        // init
        this.graphics = this.scene.add.graphics()
        this.path = this.scene.add.path(this.origin.x, this.origin.y)

        // top points
        const [A_l, A_m, A_r] = setBezierExtent(
            Direction.TOP,
            this.origin,
            defaultSpacing[Direction.TOP],
            defaultDistance[Direction.TOP]
        )

        // top right points
        const [B_l, B_m, B_r] = setBezierExtent(
            Direction.TOP_RIGHT,
            this.origin,
            defaultSpacing[Direction.TOP_RIGHT],
            defaultDistance[Direction.TOP_RIGHT]
        )

        // right points
        const [C_l, C_m, C_r] = setBezierExtent(
            Direction.RIGHT,
            this.origin,
            defaultSpacing[Direction.RIGHT],
            defaultDistance[Direction.RIGHT]
        )

        // bottom right points
        const [D_l, D_m, D_r] = setBezierExtent(
            Direction.DOWN_RIGHT,
            this.origin,
            defaultSpacing[Direction.DOWN_RIGHT],
            defaultDistance[Direction.DOWN_RIGHT]
        )

        // bottom points
        const [E_l, E_m, E_r] = setBezierExtent(
            Direction.DOWN,
            this.origin,
            defaultSpacing[Direction.DOWN],
            defaultDistance[Direction.DOWN]
        )

        // bottom left points
        const [F_l, F_m, F_r] = setBezierExtent(
            Direction.DOWN_LEFT,
            this.origin,
            defaultSpacing[Direction.DOWN_LEFT],
            defaultDistance[Direction.DOWN_LEFT]
        )

        // left points
        const [G_l, G_m, G_r] = setBezierExtent(
            Direction.LEFT,
            this.origin,
            defaultSpacing[Direction.LEFT],
            defaultDistance[Direction.LEFT]
        )

        // top left points
        const [H_l, H_m, H_r] = setBezierExtent(
            Direction.TOP_LEFT,
            this.origin,
            defaultSpacing[Direction.TOP_LEFT],
            defaultDistance[Direction.TOP_LEFT]
        )

        // connect into curves
        const curves = [
            new CubicBezier(A_m, A_r, B_l, B_m),
            new CubicBezier(B_m, B_r, C_l, C_m),
            new CubicBezier(C_m, C_r, D_l, D_m),
            new CubicBezier(D_m, D_r, E_l, E_m),
            new CubicBezier(E_m, E_r, F_l, F_m),
            new CubicBezier(F_m, F_r, G_l, G_m),
            new CubicBezier(G_m, G_r, H_l, H_m),
            new CubicBezier(H_m, H_r, A_l, A_m),
        ]

        curves.forEach((curve) => this.path.add(curve))

        this.path.closePath()

        // initialize spines
        this.spines = {
            [Direction.TOP]: {
                t: INITIAL_TWEEN_VALUE,
                path: new Line(this.origin, A_m),
                handles: [A_l, A_m, A_r],
                followerDistance: defaultDistance[Direction.TOP],
                followerSpacing: defaultSpacing[Direction.TOP],
                distanceManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultDistance[Direction.TOP]
                ),
                spacingManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultSpacing[Direction.TOP]
                ),
            },
            [Direction.TOP_RIGHT]: {
                t: INITIAL_TWEEN_VALUE,
                path: new Line(this.origin, B_m),
                handles: [B_l, B_m, B_r],
                followerDistance: defaultDistance[Direction.TOP_RIGHT],
                followerSpacing: defaultSpacing[Direction.TOP_RIGHT],
                distanceManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultDistance[Direction.TOP_RIGHT]
                ),
                spacingManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultSpacing[Direction.TOP_RIGHT]
                ),
            },
            [Direction.RIGHT]: {
                t: INITIAL_TWEEN_VALUE,
                path: new Line(this.origin, C_m),
                handles: [C_l, C_m, C_r],
                followerDistance: defaultDistance[Direction.RIGHT],
                followerSpacing: defaultSpacing[Direction.RIGHT],
                distanceManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultDistance[Direction.RIGHT]
                ),
                spacingManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultSpacing[Direction.RIGHT]
                ),
            },
            [Direction.DOWN_RIGHT]: {
                t: INITIAL_TWEEN_VALUE,
                path: new Line(this.origin, D_m),
                handles: [D_l, D_m, D_r],
                followerDistance: defaultDistance[Direction.DOWN_RIGHT],
                followerSpacing: defaultSpacing[Direction.DOWN_RIGHT],
                distanceManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultDistance[Direction.DOWN_RIGHT]
                ),
                spacingManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultSpacing[Direction.DOWN_RIGHT]
                ),
            },
            [Direction.DOWN]: {
                t: INITIAL_TWEEN_VALUE,
                path: new Line(this.origin, E_m),
                handles: [E_l, E_m, E_r],
                followerDistance: defaultDistance[Direction.DOWN],
                followerSpacing: defaultSpacing[Direction.DOWN],
                distanceManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultDistance[Direction.DOWN]
                ),
                spacingManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultSpacing[Direction.DOWN]
                ),
            },
            [Direction.DOWN_LEFT]: {
                t: INITIAL_TWEEN_VALUE,
                path: new Line(this.origin, F_m),
                handles: [F_l, F_m, F_r],
                followerDistance: defaultDistance[Direction.DOWN_LEFT],
                followerSpacing: defaultSpacing[Direction.DOWN_LEFT],
                distanceManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultDistance[Direction.DOWN_LEFT]
                ),
                spacingManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultSpacing[Direction.DOWN_LEFT]
                ),
            },
            [Direction.LEFT]: {
                t: INITIAL_TWEEN_VALUE,
                path: new Line(this.origin, G_m),
                handles: [G_l, G_m, G_r],
                followerDistance: defaultDistance[Direction.LEFT],
                followerSpacing: defaultSpacing[Direction.LEFT],
                distanceManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultDistance[Direction.LEFT]
                ),
                spacingManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultSpacing[Direction.LEFT]
                ),
            },
            [Direction.TOP_LEFT]: {
                t: INITIAL_TWEEN_VALUE,
                path: new Line(this.origin, H_m),
                handles: [H_l, H_m, H_r],
                followerDistance: defaultDistance[Direction.TOP_LEFT],
                followerSpacing: defaultSpacing[Direction.TOP_LEFT],
                distanceManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultDistance[Direction.TOP_LEFT]
                ),
                spacingManager: new SecondOrderDynamicsScalar(
                    this.config.eagerness,
                    this.config.damping,
                    this.config.anticipation,
                    defaultSpacing[Direction.TOP_LEFT]
                ),
            },
        }

        // initialize tweeners
        this.tweeners = {} as {
            [key in Direction]: Phaser.Tweens.Tween
        }

        for (const key in this.spines) {
            const enumKey = parseInt(key) as Direction
            const spine = this.spines[enumKey]

            this.tweeners[enumKey] = this.scene.tweens.add({
                targets: spine,
                t: 1,
                ease: DEFAULT_TWEEN_EASE,
                duration: Math.random() * DEFAULT_TWEEN_DURATION + DEFAULT_TWEEN_DURATION,
                yoyo: true,
                repeat: -1,
            })
        }

        // add drag handler
        // this.addMovementHandle(texture)

        // graphics fx
        this.graphics.postFX.addShine(1, 0.2, 1.3, false)
        // this.graphics.postFX.addPixelate(2)
    }

    preUpdate(time: number, delta: number) {
        this.graphics.clear()

        // uncomment to draw the path
        this.graphics.lineStyle(2, 0x000000, 1)

        // uncomment to draw the path
        this.path.draw(this.graphics)

        // uncomment to fill the path with a gradient
        // this.graphics.fillStyle(0xffffff, 1)

        // uncomment to fill the path with a gradient
        // this.graphics.fillGradientStyle(0xffffff, 0xddaaff, 0x9b7df8, 0xeeeeff, 1)

        // uncomment to fill the path
        // this.graphics.fillPoints(this.path.getPoints(), true)

        // update spines
        for (const key in this.spines) {
            const enumKey = parseInt(key) as Direction
            const spine = this.spines[enumKey]

            const newDistance = spine.distanceManager.update(
                delta,
                this.currentState.distance[enumKey]
            )
            spine.followerDistance = newDistance

            const newSpacing = spine.spacingManager.update(
                delta,
                this.currentState.spacing[enumKey]
            )
            spine.followerSpacing = newSpacing

            setBezierExtent(
                enumKey,
                this.origin,
                spine.followerSpacing,
                spine.t * spine.followerDistance,
                spine.handles[0],
                spine.handles[1],
                spine.handles[2]
            )
        }
    }

    private addMovementHandle(texture: string) {
        const handle = this.scene.add.sprite(this.origin.x, this.origin.y, texture).setInteractive()
        // handle.postFX.addPixelate(2)
        handle.postFX.addShine(1, 0.1, 1, false)

        handle.setData('vector', this.origin)

        this.scene.input.setDraggable(handle)

        this.scene.input.on(
            'drag',
            (
                _pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Arc,
                dragX: number,
                dragY: number
            ) => {
                gameObject.x = dragX
                gameObject.y = dragY

                gameObject.data.get('vector').set(dragX, dragY)
            }
        )

        return handle
    }

    public transitionTo(state: SpawnerState) {
        this.currentState = state
    }

    public getPath() {
        return this.path
    }

    public getState() {
        return this.currentState
    }
}
