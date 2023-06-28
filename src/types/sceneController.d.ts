interface SceneWithTransition extends Phaser.Scene {
    transitionIn: () => Promise<void>;
    transitionOut: () => Promise<void>;
}