export function playScore(scene: Phaser.Scene) {
    scene.sound.play('score')
}

export function playScoreChain(scene: Phaser.Scene, consecutiveHits: number) {
    scene.sound.play(`score-combo_${(consecutiveHits % 17) + 1}`)
}

export function playDeathSound(scene: Phaser.Scene) {
    scene.sound.play('player-death')
}

export function playCoinPickup(scene: Phaser.Scene) {
    scene.sound.play('coin-pickup')
}
