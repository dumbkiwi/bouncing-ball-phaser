type SpawnerInterpolationConfig = {
    // F: how quickly the object moves to the target. Note: The alg expects high distance, use values smaller than 0.01 for small distances
    eagerness: number,
    // Z: how much the eagerness gets dampened overtime.
    damping: number,
    // R: < 0: Anticipate the motion, > 0: Immediate motion, > 1: Overshoot the motion
    anticipation: number,
}