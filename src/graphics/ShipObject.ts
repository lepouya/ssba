import * as Phaser from "phaser";
import * as Helpers from "./Helpers";
import EntityManager from "../model/EntityManager";
import { Position } from "../model/Types";
import Shape from "../model/Shape";
import Ship from "../model/Ship";

export default class ShipObject {
  public container: Phaser.GameObjects.Container;
  public ship: Ship;

  private marker: Phaser.GameObjects.Container;

  constructor(public scene: Phaser.Scene, shipName: string) {
    this.ship = EntityManager.fetch(shipName) as Ship;
    this.container = scene.add.container(
      this.ship.position.x,
      this.ship.position.y,
    );

    this.container.setDepth(1);
    this.container.setRotation(this.ship.angle);

    this.addShape(scene, this.ship.shape);
    this.ship.components.forEach((sc) =>
      this.addShape(scene, sc.component.shape, sc.position),
    );

    this.marker = Helpers.drawCross(scene, 0xffffff);
  }

  private addShape(scene: Phaser.Scene, shape: Shape, position?: Position) {
    let origin = this.ship.getCenterOfMass();
    let pos = shape.getCenterPosition(position);
    this.container.add(
      scene.make.sprite({
        x: pos.x - origin.x,
        y: pos.y - origin.y,
        key: shape.bgKey,
        frame: shape.bgFrame,
      }),
    );
    if (shape.size.h > 1 || shape.size.w > 1)
      this.container.add(
        Helpers.drawCross(scene, 0xff00ff).setPosition(
          pos.x - origin.x,
          pos.y - origin.y,
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
    if (this.kBrake && this.kBrake.isDown) {
      this.ship.setAction("changeSpeed", 0);
      this.ship.setAction("changeHeading", this.ship.angle);

      this.ship.velocity.x *= 0.9;
      this.ship.velocity.y *= 0.9;
      this.ship.rotationSpeed *= 0.9;

      if (Math.abs(this.ship.velocity.x) <= 1) {
        this.ship.velocity.x = 0;
      }

      if (Math.abs(this.ship.velocity.y) <= 1) {
        this.ship.velocity.y = 0;
      }

      if (Math.abs(this.ship.rotationSpeed) <= 1) {
        this.ship.rotationSpeed = 0;
      }
    }

    if (this.kAccelerate && this.kAccelerate.isDown) {
      this.ship.setAction("changeSpeed", this.ship.speed + 100);
    }

    if (this.kLeft && this.kLeft.isDown) {
      this.ship.setAction("changeHeading", this.ship.angle - Math.PI / 10);
    }

    if (this.kRight && this.kRight.isDown) {
      this.ship.setAction("changeHeading", this.ship.angle + Math.PI / 10);
    }

    this.container.setX(this.ship.position.x);
    this.container.setY(this.ship.position.y);
    this.container.setRotation(this.ship.angle);
    this.container.update();

    this.marker.setPosition(this.ship.position.x, this.ship.position.y);
  }
}
