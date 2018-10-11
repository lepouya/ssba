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
    ))
  }

  update() {
    this.container.setX(this.ship.x);
    this.container.setY(this.ship.y);
    this.container.setRotation(this.ship.angle);
    this.container.update();
  }
}
