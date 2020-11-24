import * as Phaser from "phaser";

export function drawCross(
  scene: Phaser.Scene,
  color = 0xffffff,
  thickness = 3,
  x = 0,
  y = 0,
  depth = 1000,
): Phaser.GameObjects.Container {
  let cross = scene.add.container(x, y).setDepth(depth);

  for (let i = -thickness; i <= thickness; i++) {
    cross.add(scene.add.circle(i, 0, 1, color));
    cross.add(scene.add.circle(0, i, 1, color));
  }

  return cross;
}
