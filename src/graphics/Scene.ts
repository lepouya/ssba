import * as Phaser from 'phaser';
import ShipObject from './ShipObject';
import EntityManager from '../model/EntityManager';
import CameraObject from './CameraObject';

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

  public shipObjects = new Map<string, ShipObject>();
  public cameraObject?: CameraObject;

  constructor() {
    super({
      key: 'Game Scene',
    });
  }

  preload() {
    // Load json files
    this.load.atlas('test-ships');
    this.load.json('test-data');
    this.load.image('stars');
  }

  create() {
    EntityManager.loadAll(this.cache.json.get('test-data'));

    let shipS = new ShipObject(this, 'Ship S');
    let shipL = new ShipObject(this, 'Ship L');
    this.shipObjects.set('Ship S', shipS);
    this.shipObjects.set('Ship L', shipL);
    shipS.setKeys('W', 'S', 'A', 'D');
    shipL.setKeys('UP', 'DOWN', 'LEFT', 'RIGHT');

    this.cameras.main.setBounds(-5000, -5000, 10000, 10000);
    this.cameraObject = new CameraObject(this);
    this.cameraObject!.followObjects.add(shipS.container);
    this.cameraObject!.followObjects.add(shipL.container);

    this.initialized = true;
  }

  update() {
    this.shipObjects.forEach(shipObject => shipObject.update());
    this.cameraObject!.update();
  }
}
