import React from "react";

import Spinner from "./Spinner";
import Game from "./Game";

import bind from "../utils/bind";
import Scene from "../graphics/Scene";

interface LoaderState {
  loaded: boolean;
}

export default class Loader extends React.Component<{}, LoaderState> {
  constructor(props: any) {
    super(props);
    this.state = { loaded: false };
  }

  componentDidMount() {
    if (!this.state.loaded) {
      setTimeout(this.load, 1);
    }
  }

  @bind
  async load() {
    if (!Scene.game) {
      Scene.initialize();
    }

    if (Scene.isInitialized()) {
      this.setState({ loaded: true });
    } else {
      setTimeout(this.load, 100);
    }
  }

  render() {
    if (this.state.loaded) {
      return <Game />;
    } else {
      return <Spinner />;
    }
  }
}
