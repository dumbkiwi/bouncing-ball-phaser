interface SceneWithTransition extends Phaser.Scene {
    transitionIn: () => Promise<void>;
    transitionOut: () => Promise<void>;
}

interface SceneWithOverlay extends Phaser.Scene {
    createOverlay: () => Promise<void>;
    removeOverlay: () => void;
}