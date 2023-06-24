import Vector2 = Phaser.Math.Vector2

const PI = Math.PI

export default class SecondOrderDynamics {
    // previous input
    private xp: Vector2

    // state variables
    private y: Vector2
    private yd: Vector2

    // dynamics constants
    private k1: number
    private k2: number
    private k3: number

    /**
     * Creates a new second order dynamics object
     * @param f modulation frequency
     * @param z reaction damping
     * @param r response eagerness
     * @param xi initial state
     */
    constructor(f: number, z: number, r: number, xi: Vector2) {
        // compute constants
        this.k1 = z / (PI * f)
        this.k2 = 1 / ((2 * PI * f) * (2 * PI * f))
        this.k3 = r * z / (2 * PI * f)

        // initialize state variables
        this.xp = new Vector2(xi.x, xi.y)
        this.y = new Vector2(xi.x, xi.y)
        this.yd = new Vector2(0, 0)
    }

    public update(T: number, x: Vector2, xd: Vector2 | null = null) {
        if (xd === null) {
            // estimate velocity
            xd = new Vector2(
                (x.x - this.xp.x) / T,
                (x.y - this.xp.y) / T
            )

            this.xp.x = x.x
            this.xp.y = x.y
        }

        // clamp k2 to guarantee stability without jitter
        const k2_stable = Math.max(this.k2, T * T / 2 + T * this.k1 / 2, T * this.k1)

        // integrate position by velocity
        this.y.x = this.y.x + T * this.yd.x
        this.y.y = this.y.y + T * this.yd.y

        // integrate velocity by acceleration
        this.yd.x = this.yd.x + T * (x.x + this.k3 * xd.x - this.y.x - this.k1 * this.yd.x) / k2_stable
        this.yd.y = this.yd.y + T * (x.y + this.k3 * xd.y - this.y.y - this.k1 * this.yd.y) / k2_stable

        return this.y
    }
}

export class SecondOrderDynamicsScalar {
    // previous input
    private xp: number

    // state variables
    private y: number
    private yd: number

    // dynamics constants
    private k1: number
    private k2: number
    private k3: number

    /**
     * Creates a new second order dynamics object
     * @param f modulation frequency
     * @param z reaction damping
     * @param r response eagerness
     * @param xi initial state
     */
    constructor(f: number, z: number, r: number, xi: number) {
        // compute constants
        this.k1 = z / (PI * f)
        this.k2 = 1 / ((2 * PI * f) * (2 * PI * f))
        this.k3 = r * z / (2 * PI * f)

        // initialize state variables
        this.xp = xi
        this.y = xi
        this.yd = 0
    }

    public update(T: number, x: number, xd: number | null = null) {
        if (xd === null) {
            // estimate velocity
            xd = (x - this.xp) / T

            this.xp = x
        }

        // clamp k2 to guarantee stability without jitter
        const k2_stable = Math.max(this.k2, T * T / 2 + T * this.k1 / 2, T * this.k1)

        // integrate position by velocity
        this.y = this.y + T * this.yd

        // integrate velocity by acceleration
        this.yd = this.yd + T * (x + this.k3 * xd - this.y - this.k1 * this.yd) / k2_stable

        return this.y
    }
}