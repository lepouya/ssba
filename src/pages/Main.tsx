import React from 'react';
import ReactDOM from 'react-dom';
import { RouteComponentProps } from 'react-router';
import * as Phaser from 'phaser';

export default class Main extends React.Component<RouteComponentProps<any>> {
  public game: Phaser.Game;
  public scene: Phaser.Scene;

  constructor(props: RouteComponentProps<any>) {
    super(props);

    this.scene = new class extends Phaser.Scene {
      constructor() {
        super({
          key: 'main scene',
        })
      }

      preload() {
        this.load.image('clown', 'clown.png');
      }

      create() {
        this.add.image(400, 300, 'clown');
      }
    };

    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      loader: {
        baseURL: 'https://labs.phaser.io/',
        path: 'assets/sprites/',
        crossOrigin: 'Anonymous',
      },
      scene: this.scene,
    });
  }

  componentDidMount() {
    let domNode = ReactDOM.findDOMNode(this);
    if (domNode && this.game) {
      domNode.appendChild(this.game.canvas);
    }
  }

  render() {
    return <div />;
  }
}