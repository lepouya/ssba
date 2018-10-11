import * as Phaser from 'phaser';
import Ship from '../model/Ship';
import EntityManager from '../model/EntityManager';
import Scene from './Scene';

export default class ShipObject {
  public container: Phaser.GameObjects.Container;
  public ship: Ship;

  constructor(shipObj: string) {
    this.ship = EntityManager.fetch(shipObj) as Ship;
    this.container = Scene.scene.add.container(this.ship.x, this.ship.y);

    this.container.setRotation(this.ship.angle);

    this.container.add(Scene.scene.make.sprite({
      key: this.ship.shape.bgKey,
      frame: this.ship.shape.bgFrame,
    }));

    let originX = this.ship.shape.w * this.ship.shape.cellW / 2;
    let originY = this.ship.shape.h * this.ship.shape.cellH / 2;

    this.ship.components.forEach(sc => this.container.add(
      Scene.scene.make.sprite({
        x: (sc.x + sc.component.shape.w / 2) * sc.component.shape.cellW - originX,
        y: (sc.y + sc.component.shape.h / 2) * sc.component.shape.cellH - originY,
        key: sc.component.shape.bgKey,
        frame: sc.component.shape.bgFrame,
      })
    ));
  }

  private kAccelerate?: Phaser.Input.Keyboard.Key;
  private kBrake?: Phaser.Input.Keyboard.Key;
  private kLeft?: Phaser.Input.Keyboard.Key;
  private kRight?: Phaser.Input.Keyboard.Key;
  public setKeys(accelerate: string, brake: string, left: string, right: string) {
    this.kAccelerate = Scene.scene.input.keyboard.addKey(accelerate);
    this.kBrake = Scene.scene.input.keyboard.addKey(brake);
    this.kLeft = Scene.scene.input.keyboard.addKey(left);
    this.kRight = Scene.scene.input.keyboard.addKey(right);
  }

  update() {
    if (this.kAccelerate && this.kAccelerate.isDown) {
      this.ship.dx += Math.sin(this.ship.angle);
      this.ship.dy -= Math.cos(this.ship.angle);
    }

    if (this.kBrake && this.kBrake.isDown) {
      this.ship.dx *= 0.95;
      this.ship.dy *= 0.95;
      this.ship.da *= 0.95;

      if (Math.abs(this.ship.dx) <= 0.05) {
        this.ship.dx = 0;
      }

      if (Math.abs(this.ship.dy) <= 0.05) {
        this.ship.dy = 0;
      }

      if (Math.abs(this.ship.da) <= 0.05) {
        this.ship.da = 0;
      }
    }

    if (this.kLeft && this.kLeft.isDown) {
      this.ship.da -= 0.01;
    }

    if (this.kRight && this.kRight.isDown) {
      this.ship.da += 0.01;
    }

    this.container.setX(this.ship.x);
    this.container.setY(this.ship.y);
    this.container.setRotation(this.ship.angle);
    this.container.update();
  }
}
