import React from 'react';
import { HashRouter, Link, Route, Switch } from 'react-router-dom';
import bind from '../utils/bind';

import Main from '../pages/Main';
import Help from '../pages/Help';

interface GameProps {
}

interface GameState {
  lastUpdate: number;
  timerId?: NodeJS.Timer;
}

export default class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);

    this.state = {
      lastUpdate: Date.now(),
      timerId: undefined,
    };
  }

  componentDidMount() {
    if (!this.state.timerId) {
      const timerId = setInterval(
        this.tick,
        1000 / 60,
      );
      this.setState({ timerId });
    }
  }

  componentWillUnmount() {
    if (this.state.timerId) {
      clearInterval(this.state.timerId);
      this.setState({ timerId: undefined });
    }
  }

  @bind
  tick() {
    const now = Date.now();
    this.setState({ lastUpdate: now });
  }

  render() {
    return (
      <HashRouter>
        <div>
          <header>
            <div className="top-bar" id="navBar" style={{padding: 0}}>
              <div className="top-bar-left">
                <ul className="menu">
                  <li><Link to="/">Main</Link></li>
                  <li><Link to="/help">Help</Link></li>
                </ul>
              </div>
              <div className="top-bar-right">
                fps
              </div>
            </div>
          </header>
          <main>
            <Switch>
              <Route exact path="/" component={Main} />
              <Route path="/help" component={Help} />
            </Switch>
          </main>
        </div>
      </HashRouter>
    );
  }
}