import React from 'react';
import ReactDOM from 'react-dom';
import { RouteComponentProps } from 'react-router';
import Scene from '../graphics/Scene';

export default class Main extends React.Component<RouteComponentProps<any>> {
  componentDidMount() {
    let domNode = ReactDOM.findDOMNode(this);
    if (domNode && Scene.game) {
      domNode.appendChild(Scene.game.canvas);
    }
  }

  render() {
    return <div />;
  }
}