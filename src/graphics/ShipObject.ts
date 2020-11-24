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
      this.ship.velocity.x *= 0.95;
      this.ship.velocity.y *= 0.95;
      this.ship.rotationSpeed *= 0.95;

      if (Math.abs(this.ship.velocity.x) <= 0.05) {
        this.ship.velocity.x = 0;
      }

      if (Math.abs(this.ship.velocity.y) <= 0.05) {
        this.ship.velocity.y = 0;
      }

      if (Math.abs(this.ship.rotationSpeed) <= 0.05) {
        this.ship.rotationSpeed = 0;
      }
    }

    let CoM = this.ship.getCenterOfMass();

    if (this.kAccelerate && this.kAccelerate.isDown) {
      // this.ship.addVelocity({ size: 1, angle: this.ship.angle });
      this.ship.applyForce(
        { x: CoM.x, y: CoM.y + 40 },
        { size: 500, angle: this.ship.angle },
        1 / 60,
      );
    }

    if (this.kLeft && this.kLeft.isDown) {
      // this.ship.rotationSpeed -= 0.01;
      this.ship.applyForce(
        { x: CoM.x, y: CoM.y + 40 },
        { size: 250, angle: this.ship.angle + Math.PI / 2 },
        1 / 60,
      );
    }

    if (this.kRight && this.kRight.isDown) {
      // this.ship.rotationSpeed += 0.01;
      this.ship.applyForce(
        { x: CoM.x, y: CoM.y + 40 },
        { size: 250, angle: this.ship.angle - Math.PI / 2 },
        1 / 60,
      );
    }

    this.container.setX(this.ship.position.x);
    this.container.setY(this.ship.position.y);
    this.container.setRotation(this.ship.angle);
    this.container.update();

    this.marker.setPosition(this.ship.position.x, this.ship.position.y);
  }
}
