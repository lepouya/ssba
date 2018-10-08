import * as Phaser from 'phaser';
import Entity from '../model/Entity';
import Ship from '../model/Ship';
import Component from '../model/Component';
import Shape from '../model/Shape';

export default class Scene extends Phaser.Scene {
  public static scene: Phaser.Scene;
  public static game: Phaser.Game;

  public initialized = false;

  static initialize() {
    Scene.scene = new Scene();

    Scene.game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      loader: {
        path: 'assets',
      },
      physics: {
        default: 'arcade',
      },
      scene: Scene.scene,
    });
  }

  static isInitialized() {
    return (Scene.scene && (Scene.scene as Scene).initialized);
  }

  constructor() {
    super({
      key: 'Game Scene',
    });
  }

  preload() {
    // Load json files
    this.load.atlas('test-ships');
    this.load.json('test-data');

    // Make sure all entity types are initialized
    Entity.entityTypes;
    Ship.entityTypes;
    Component.entityTypes;
    Shape.entityTypes;
  }

  create() {
    Entity.loadAll(this.cache.json.get('test-data'));
    this.getShipObject('Ship S');
    this.getShipObject('Ship L');

    this.initialized = true;
  }

  getShipObject(shipName: string): Phaser.GameObjects.GameObject {
    let ship = Entity.loadNew(shipName) as Ship;
    let originX = ship.shape.w * ship.shape.cellW / 2;
    let originY = ship.shape.h * ship.shape.cellH / 2;

    let container = this.add.container(ship.x, ship.y);
    container.setRotation(ship.angle);

    container.add(this.make.sprite({
      key: ship.shape.bgKey,
      frame: ship.shape.bgFrame,
    }));

    ship.components.forEach(component => container.add(
      this.make.sprite({
        x: (component.x + component.shape.w / 2) * component.shape.cellW - originX,
        y: (component.y + component.shape.h / 2) * component.shape.cellH - originY,
        key: component.shape.bgKey,
        frame: component.shape.bgFrame,
      })
    ))

    return container;
  }
}
