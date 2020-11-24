import * as Phaser from "phaser";
import Ship from "../model/Ship";
import EntityManager from "../model/EntityManager";

export default class ShipObject {
  public container: Phaser.GameObjects.Container;
  public ship: Ship;

  constructor(public scene: Phaser.Scene, shipName: string) {
    this.ship = EntityManager.fetch(shipName) as Ship;
    this.container = scene.add.container(
      this.ship.position.x,
      this.ship.position.y,
    );

    this.container.setDepth(1000);
    this.container.setRotation(this.ship.angle);

    this.container.add(
      scene.make.sprite({
        key: this.ship.shape.bgKey,
        frame: this.ship.shape.bgFrame,
      }),
    );

    let originX = (this.ship.shape.size.w * this.ship.shape.cellSize.w) / 2;
    let originY = (this.ship.shape.size.h * this.ship.shape.cellSize.h) / 2;

    this.ship.components.forEach((sc) =>
      this.container.add(
        scene.make.sprite({
          x:
            (sc.position.x + sc.component.shape.size.w / 2) *
              sc.component.shape.cellSize.w -
            originX,
          y:
            (sc.position.y + sc.component.shape.size.h / 2) *
              sc.component.shape.cellSize.h -
            originY,
          key: sc.component.shape.bgKey,
          frame: sc.component.shape.bgFrame,
        }),
      ),
    );
  }

  private kAccelerate?: Phaser.Input.Keyboard.Key;
  private kBrake?: Phaser.Input.Keyboard.Key;
  private kLeft?: Phaser.Input.Keyboard.Key;
  private kRight?: Phaser.Input.Keyboard.Key;
  public setKeys(
    accelerate: string,
    brake: string,
    left: string,
    right: string,
  ) {
    this.kAccelerate = this.scene.input.keyboard.addKey(accelerate);
    this.kBrake = this.scene.input.keyboard.addKey(brake);
    this.kLeft = this.scene.input.keyboard.addKey(left);
    this.kRight = this.scene.input.keyboard.addKey(right);
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

    this.container.setX(this.ship.position.x);
    this.container.setY(this.ship.position.y);
    this.container.setRotation(this.ship.angle);
    this.container.update();
  }
}
