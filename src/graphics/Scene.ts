import * as Phaser from 'phaser';
import Entity from '../model/Entity';

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
    this.load.atlas('test-ships');
    this.load.json('test-data');
  }

  create() {
    this.physics.add.image(400, 300, 'test-ships', 'Ship L');
    Entity.loadAll(this.cache.json.get('test-data'));
    this.initialized = true;
  }
}
