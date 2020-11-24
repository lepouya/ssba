import * as Phaser from "phaser";
import * as Helpers from "./Helpers";

export default class Background {
  public tiles: Phaser.GameObjects.TileSprite;

  constructor(
    public scene: Phaser.Scene,
    texture: string,
    width: number,
    height: number,
  ) {
    this.tiles = scene.add.tileSprite(0, 0, width, height, texture);
    this.tiles.setDepth(0);
    Helpers.drawCross(scene, 0x00ffff);
  }

  update() {
    //let camera = this.scene.cameras.main;
  }
}
