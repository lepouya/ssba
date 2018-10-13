import * as Phaser from 'phaser';

export default class CameraObject {
  public container: Phaser.GameObjects.Container;
  public followObjects = new Set<Phaser.GameObjects.Components.Transform>();
  public angle = 0;
  public scale = 1;

  constructor(public scene: Phaser.Scene) {
    this.container = scene.add.container(scene.cameras.main.centerX, scene.cameras.main.centerY);
    this.scene.cameras.main.startFollow(this.container, false, 0.1, 0.1);
  }

  update() {
    let camera = this.scene.cameras.main;

    let x = camera.centerX;
    let y = camera.centerY;
    let c = 1;

    this.followObjects.forEach(obj => {
      x += obj.x;
      y += obj.y;
      c ++;
    });

    x /= c;
    y /= c;

    let cx = camera.width / 2, cy = camera.height / 2;
    let maxX = cx, maxY = cy;

    this.followObjects.forEach(obj => {
      maxX = Math.max(maxX, Math.abs(obj.x - x) * 1.1);
      maxY = Math.max(maxY, Math.abs(obj.y - y) * 1.1);
    });

    this.container.setPosition(x, y);
    this.scene.cameras.main.setZoom(Math.min(cx / maxX, cy / maxY));
  }
}
