import SecondOrderDynamics from "@/classes/SecondOrderDynamics"
import Vector2 = Phaser.Math.Vector2

const ORIGIN = new Phaser.Math.Vector2(200, 200)
const MAX_DISTANCE = 200
const SPACING = 50
const STARTING_TWEEN = 0.8

// dynamic
const F = 0.001
const Z = 0.5
const R = 2

const SQRT_2 = Math.sqrt(2)

enum HandleDirection {
    TOP,
    DOWN,
    LEFT,
    RIGHT,
    TOP_LEFT,
    TOP_RIGHT,
    DOWN_LEFT,
    DOWN_RIGHT,
}

const DIRECTION_VECTOR: {
    [key in HandleDirection]: Vector2
} = {
    [HandleDirection.TOP]: new Vector2(0, -1),
    [HandleDirection.DOWN]: new Vector2(0, 1),
    [HandleDirection.LEFT]: new Vector2(-1, 0),
    [HandleDirection.RIGHT]: new Vector2(1, 0),
    [HandleDirection.TOP_LEFT]: new Vector2(-SQRT_2 / 2, -SQRT_2 / 2),
    [HandleDirection.TOP_RIGHT]: new Vector2(SQRT_2 / 2, -SQRT_2 / 2),
    [HandleDirection.DOWN_LEFT]: new Vector2(-SQRT_2 / 2, SQRT_2 / 2),
    [HandleDirection.DOWN_RIGHT]: new Vector2(SQRT_2 / 2, SQRT_2 / 2),
}

function GetBezierExtent(
    direction: Vector2, 
    origin: Vector2 = new Vector2(),
    spacing = 1,
    distance = 1,
    start: Vector2 = new Vector2(),
    middle: Vector2 = new Vector2(),
    end: Vector2 = new Vector2(),
    ): [Vector2, Vector2, Vector2] {
    /** For
     * D: distance
     * S: spacing
     * Transformation matrix is:
     * D  S
     * D  0
     * D -S */ 

    /** For direction = (A, B)
     * Input matrix is:
     * A  B
     * B -A
     */

    /** Output for each row of the transform matrix:
     * x = [A, B] * [D, S] = AD + BS
     * y = [B, -A] * [D, 0] = BD
     */
    
    start.x = origin.x + direction.x * distance + direction.y * spacing
    start.y = origin.y + direction.y * distance - direction.x * spacing
    
    middle.x = origin.x + direction.x * distance
    middle.y = origin.y + direction.y * distance

    end.x = origin.x + direction.x * distance - direction.y * spacing
    end.y = origin.y + direction.y * distance + direction.x * spacing
    
    return [start, middle, end]
}

export default class Gameplay extends Phaser.Scene {
    public dynamicManager!: SecondOrderDynamics
    public dragPosition!: Vector2

    public origin!: Vector2

    public graphics!: Phaser.GameObjects.Graphics

    public path!: Phaser.Curves.Path // the whole path that the ball will travel along

    public tweeners!: {
        [key in HandleDirection]: {t: number, vec: Phaser.Math.Vector2
    }}

    // the path that the main handles of the bezier move along
    public tweenPaths!: {
        [key in HandleDirection]: Phaser.Curves.Line
    }

    public handles!: {
        [key in HandleDirection]: [Vector2, Vector2, Vector2]
    }
    
    public immediateDistance!: {
        [key in HandleDirection]: Vector2
    }

    public lagDistance!: {
        [key in HandleDirection]: Vector2
    }

    public lagDynamicManager!: {
        [key in HandleDirection]: SecondOrderDynamics
    }

    public tweenPoints!: {
        [key in HandleDirection]: Phaser.Math.Vector2[]
    }

    public tweeningTweens!: {
        [key in HandleDirection]: Phaser.Tweens.Tween
    }

    create() {
        this.origin = new Vector2(ORIGIN.x, ORIGIN.y)
        
        this.dynamicManager = new SecondOrderDynamics(F, Z, R, this.origin)
        this.dragPosition = new Vector2(ORIGIN.x, ORIGIN.y)

        this.graphics = this.add.graphics()

        this.path = this.add.path(0, 0)

        this.tweeners = {
            [HandleDirection.TOP]: {t: STARTING_TWEEN, vec: new Vector2()},
            [HandleDirection.DOWN]: {t: STARTING_TWEEN, vec: new Vector2()},
            [HandleDirection.LEFT]: {t: STARTING_TWEEN, vec: new Vector2()},
            [HandleDirection.RIGHT]: {t: STARTING_TWEEN, vec: new Vector2()},
            [HandleDirection.TOP_LEFT]: {t: STARTING_TWEEN, vec: new Vector2()},
            [HandleDirection.TOP_RIGHT]: {t: STARTING_TWEEN, vec: new Vector2()},
            [HandleDirection.DOWN_LEFT]: {t: STARTING_TWEEN, vec: new Vector2()},
            [HandleDirection.DOWN_RIGHT]: {t: STARTING_TWEEN, vec: new Vector2()},
        }

        // top points
        const [A_l, A_m, A_r] = GetBezierExtent(DIRECTION_VECTOR[HandleDirection.TOP], this.origin, SPACING, MAX_DISTANCE)

        // top right points
        const [B_l, B_m, B_r] = GetBezierExtent(DIRECTION_VECTOR[HandleDirection.TOP_RIGHT], this.origin, SPACING, MAX_DISTANCE)
        
        // right points
        const [C_l, C_m, C_r] = GetBezierExtent(DIRECTION_VECTOR[HandleDirection.RIGHT], this.origin, SPACING, MAX_DISTANCE)

        // bottom right points
        const [D_l, D_m, D_r] = GetBezierExtent(DIRECTION_VECTOR[HandleDirection.DOWN_RIGHT], this.origin, SPACING, MAX_DISTANCE)

        // bottom points
        const [E_l, E_m, E_r] = GetBezierExtent(DIRECTION_VECTOR[HandleDirection.DOWN], this.origin, SPACING, MAX_DISTANCE)

        // bottom left points
        const [F_l, F_m, F_r] = GetBezierExtent(DIRECTION_VECTOR[HandleDirection.DOWN_LEFT], this.origin, SPACING, MAX_DISTANCE)

        // left points
        const [G_l, G_m, G_r] = GetBezierExtent(DIRECTION_VECTOR[HandleDirection.LEFT], this.origin, SPACING, MAX_DISTANCE)

        // top left points
        const [H_l, H_m, H_r] = GetBezierExtent(DIRECTION_VECTOR[HandleDirection.TOP_LEFT], this.origin, SPACING, MAX_DISTANCE)

        // connect into curves
        const curves = [
            new Phaser.Curves.CubicBezier(A_m, A_r, B_l, B_m),
            new Phaser.Curves.CubicBezier(B_m, B_r, C_l, C_m),
            new Phaser.Curves.CubicBezier(C_m, C_r, D_l, D_m),
            new Phaser.Curves.CubicBezier(D_m, D_r, E_l, E_m),
            new Phaser.Curves.CubicBezier(E_m, E_r, F_l, F_m),
            new Phaser.Curves.CubicBezier(F_m, F_r, G_l, G_m),
            new Phaser.Curves.CubicBezier(G_m, G_r, H_l, H_m),
            new Phaser.Curves.CubicBezier(H_m, H_r, A_l, A_m),
        ]

        curves.forEach(curve => this.path.add(curve))

        this.path.closePath()

        // create the tween paths, from the origin to the handles
        this.tweenPaths = {
            [HandleDirection.TOP]: new Phaser.Curves.Line(this.origin, new Vector2(A_m)),
            [HandleDirection.DOWN]: new Phaser.Curves.Line(this.origin, new Vector2(E_m)),
            [HandleDirection.LEFT]: new Phaser.Curves.Line(this.origin, new Vector2(G_m)),
            [HandleDirection.RIGHT]: new Phaser.Curves.Line(this.origin, new Vector2(C_m)),
            [HandleDirection.TOP_LEFT]: new Phaser.Curves.Line(this.origin, new Vector2(H_m)),
            [HandleDirection.TOP_RIGHT]: new Phaser.Curves.Line(this.origin, new Vector2(B_m)),
            [HandleDirection.DOWN_LEFT]: new Phaser.Curves.Line(this.origin, new Vector2(F_m)),
            [HandleDirection.DOWN_RIGHT]: new Phaser.Curves.Line(this.origin, new Vector2(D_m)),
        }

        // iterate through paths to create this.tweenPoints
        this.tweenPoints = {} as {
            [key in HandleDirection]: Vector2[]
        }

        Object.keys(this.tweenPaths).forEach(key => {
            const enumKey = parseInt(key) as HandleDirection
            this.tweenPoints[enumKey] = this.tweenPaths[enumKey].getSpacedPoints(32)
        })

        
        this.handles = {
            [HandleDirection.TOP]: [A_l, A_m, A_r],
            [HandleDirection.DOWN]: [E_l, E_m, E_r],
            [HandleDirection.LEFT]: [G_l, G_m, G_r],
            [HandleDirection.RIGHT]: [C_l, C_m, C_r],
            [HandleDirection.TOP_LEFT]: [H_l, H_m, H_r],
            [HandleDirection.TOP_RIGHT]: [B_l, B_m, B_r],
            [HandleDirection.DOWN_LEFT]: [F_l, F_m, F_r],
            [HandleDirection.DOWN_RIGHT]: [D_l, D_m, D_r],
        }

        this.immediateDistance = {
            [HandleDirection.TOP]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.DOWN]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.LEFT]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.RIGHT]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.TOP_LEFT]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.TOP_RIGHT]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.DOWN_LEFT]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.DOWN_RIGHT]: new Vector2(MAX_DISTANCE, 0),
        }

        this.lagDistance = {
            [HandleDirection.TOP]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.DOWN]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.LEFT]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.RIGHT]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.TOP_LEFT]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.TOP_RIGHT]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.DOWN_LEFT]: new Vector2(MAX_DISTANCE, 0),
            [HandleDirection.DOWN_RIGHT]: new Vector2(MAX_DISTANCE, 0),
        }

        // temporaily using just the x of the vector
        this.lagDynamicManager = {
            [HandleDirection.TOP]: new SecondOrderDynamics(F, Z, R, new Vector2(MAX_DISTANCE, 0)),
            [HandleDirection.DOWN]: new SecondOrderDynamics(F, Z, R, new Vector2(MAX_DISTANCE, 0)),
            [HandleDirection.LEFT]: new SecondOrderDynamics(F, Z, R, new Vector2(MAX_DISTANCE, 0)),
            [HandleDirection.RIGHT]: new SecondOrderDynamics(F, Z, R, new Vector2(MAX_DISTANCE, 0)),
            [HandleDirection.TOP_LEFT]: new SecondOrderDynamics(F, Z, R, new Vector2(MAX_DISTANCE, 0)),
            [HandleDirection.TOP_RIGHT]: new SecondOrderDynamics(F, Z, R, new Vector2(MAX_DISTANCE, 0)),
            [HandleDirection.DOWN_LEFT]: new SecondOrderDynamics(F, Z, R, new Vector2(MAX_DISTANCE, 0)),
            [HandleDirection.DOWN_RIGHT]: new SecondOrderDynamics(F, Z, R, new Vector2(MAX_DISTANCE, 0)),
        }

        // create the tweeners
        this.tweeningTweens = {} as {
            [key in HandleDirection]: Phaser.Tweens.Tween
        }

        for (const key in this.tweeners) {
            const enumKey = parseInt(key) as HandleDirection
            this.tweeningTweens[enumKey] = this.tweens.add({
                targets: this.tweeners[enumKey],
                t: 1,
                ease: 'Sine.easeInOut',
                duration: Math.random() * 1000 + 1000,
                yoyo: true,
                repeat: -1,
            })
        }

        // // change tween target on pointer down
        // this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
        //     for (const key in this.tweeners) {
        //         const enumKey = parseInt(key) as HandleDirection
        //         this.tweeningTweens[enumKey].updateTo('t', MAX_DISTANCE * 0.5)
                
        //     }
        // })

        this.addMovementHandle()
    }

    update(_t: number, delta: number) {
        this.graphics.clear()

        // get follower position
        const follower = this.dynamicManager.update(delta, this.dragPosition)

        // update follower position
        this.origin.x = follower.x
        this.origin.y = follower.y

        //  Draw the curve through the points
        // this.graphics.lineStyle(4, 0xffffff, 1)
        this.graphics.fillStyle(0xffffff, 1)

        this.graphics.fillPoints(this.path.getPoints(), true, true)
        // this.path.draw(this.graphics)

        for (const key in this.tweeners) {
            const enumKey = parseInt(key) as HandleDirection

            // update distance
            const newDistance = this.lagDynamicManager[enumKey].update(delta, this.immediateDistance[enumKey])
            this.lagDistance[enumKey].x = newDistance.x
            this.lagDistance[enumKey].y = newDistance.y

            this.handleChange(enumKey, this.tweeners[enumKey].t, this.lagDistance[enumKey].x, this.handles[enumKey])
        }

        // LEGACY: currently not doing anything, used to be used to draw circle traveling along path
        // this.graphics.fillStyle(0xffff00, 1)
        // this.graphics.fillCircle(this.tweenPath.vec.x, this.tweenPath.vec.y, 16)
    }

    private handleChange(direction: HandleDirection, t: number, distance: number, vecs: [Vector2, Vector2, Vector2]) {
        GetBezierExtent(
            DIRECTION_VECTOR[direction], 
            this.origin, 
            SPACING, 
            t * distance,
            vecs[0], 
            vecs[1], 
            vecs[2])

        this.tweenPoints[direction] = this.tweenPaths[direction].getSpacedPoints(32)
    }

    private addMovementHandle() {
        const handle = this.add.circle(this.origin.x, this.origin.y, 40, 0xaaaaee).setInteractive()
        
        handle.setData('vector', this.dragPosition)
        
        this.input.setDraggable(handle)

        this.input.on('dragstart', (_pointer: Phaser.Input.Pointer, _gameObject: Phaser.GameObjects.Arc) => {
            this.immediateDistance[HandleDirection.TOP].x = MAX_DISTANCE
            this.immediateDistance[HandleDirection.DOWN].x = MAX_DISTANCE
            this.immediateDistance[HandleDirection.LEFT].x = MAX_DISTANCE / 1.5
            this.immediateDistance[HandleDirection.RIGHT].x = MAX_DISTANCE / 1.5
            this.immediateDistance[HandleDirection.TOP_LEFT].x = MAX_DISTANCE / 3
            this.immediateDistance[HandleDirection.TOP_RIGHT].x = MAX_DISTANCE / 3
            this.immediateDistance[HandleDirection.DOWN_LEFT].x = MAX_DISTANCE / 3
            this.immediateDistance[HandleDirection.DOWN_RIGHT].x = MAX_DISTANCE / 3

        })

        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, _gameObject: Phaser.GameObjects.Arc) => {
            // reset
            this.immediateDistance[HandleDirection.TOP].x = MAX_DISTANCE
            this.immediateDistance[HandleDirection.DOWN].x = MAX_DISTANCE
            this.immediateDistance[HandleDirection.LEFT].x = MAX_DISTANCE
            this.immediateDistance[HandleDirection.RIGHT].x = MAX_DISTANCE
            this.immediateDistance[HandleDirection.TOP_LEFT].x = MAX_DISTANCE
            this.immediateDistance[HandleDirection.TOP_RIGHT].x = MAX_DISTANCE
            this.immediateDistance[HandleDirection.DOWN_LEFT].x = MAX_DISTANCE
            this.immediateDistance[HandleDirection.DOWN_RIGHT].x = MAX_DISTANCE
        })

        this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Arc, dragX: number, dragY: number) => {
            // update target position
            this.dragPosition.x = dragX
            this.dragPosition.y = dragY
            
            gameObject.x = dragX
            gameObject.y = dragY

            gameObject.data.get('vector').set(dragX, dragY)
        })

        return handle
    }
}
