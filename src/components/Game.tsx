import React from 'react';
import { HashRouter, NavLink, Route, Switch } from 'react-router-dom';

import Main from '../pages/Main';
import Help from '../pages/Help';
import bind from '../utils/bind';

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
          <nav className="uk-navbar-container" uk-navbar="">
            <div className="uk-navbar-left">
              <ul className="uk-navbar-nav">
                <li><NavLink activeClassName="uk-active" exact to="/">Main</NavLink></li>
                <li><NavLink activeClassName="uk-active" to="/help">Help</NavLink></li>
              </ul>
            </div>
            <div className="uk-navbar-right">
              <ul className="uk-navbar-nav">
                <li>fps</li>
              </ul>
            </div>
          </nav>
          <Switch>
            <Route exact path="/" component={Main} />
            <Route path="/help" component={Help} />
          </Switch>
        </div>
      </HashRouter>
    );
  }
}