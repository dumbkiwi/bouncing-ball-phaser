export default class Ball extends Phaser.Physics.Arcade.Image {
    private acceleration: Phaser.Math.Vector2
    private pointer: Phaser.Input.Pointer
    private ignoreInput = false

    constructor(acceleration: number, scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture)
        scene.add.existing(this)
        scene.physics.add.existing(this)

        if (!this.body) {
            throw new Error('Ball body is null')
        }

        this.onCreate()
        this.acceleration = new Phaser.Math.Vector2(0, acceleration).scale(1 / this.body?.mass)
        this.pointer = scene.input.activePointer

        this.scene.events.on('update', this.onUpdate, this)
    }

    onCreate () {
        this.setBounce(1)
        this.setCollideWorldBounds(true)
    }

    onUpdate () {
        if (!this.ignoreInput && this.pointer.isDown) {
            this.body?.velocity.add(this.acceleration)
        }
    }

    public setIgnoreInput(ignore = true): void {
        this.ignoreInput = ignore
    }

}
