import * as Phaser from 'phaser';
import Ship from '../model/Ship';
import EntityManager from '../model/EntityManager';

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
  }

  create() {
    EntityManager.loadAll(this.cache.json.get('test-data'));
    this.getShipObject('Ship S');
    this.getShipObject('Ship L');

    this.initialized = true;
  }

  getShipObject(shipName: string): Phaser.GameObjects.GameObject {
    let ship = EntityManager.load(shipName) as Ship;
    let originX = ship.shape.w * ship.shape.cellW / 2;
    let originY = ship.shape.h * ship.shape.cellH / 2;

    let container = this.add.container(ship.x, ship.y);
    container.setRotation(ship.angle);

    container.add(this.make.sprite({
      key: ship.shape.bgKey,
      frame: ship.shape.bgFrame,
    }));

    ship.components.forEach(sc => container.add(
      this.make.sprite({
        x: (sc.x + sc.component.shape.w / 2) * sc.component.shape.cellW - originX,
        y: (sc.y + sc.component.shape.h / 2) * sc.component.shape.cellH - originY,
        key: sc.component.shape.bgKey,
        frame: sc.component.shape.bgFrame,
      })
    ))

    return container;
  }
}
