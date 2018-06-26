import React, { Component } from "react";

import constants from "../../../constants";
import utilities from "../../../utilities";
import "./Member.css";

const { POSSIBLE_ESTIMATES } = constants;
const { composeClassName } = utilities;

export default class Member extends Component {
  /* Instance fields. */

  actionListenerUnregisterers = [];

  /* React lifecycle. */

  constructor(props) {
    super(props);
    
    this.state = {
      error: null,
      estimate: null,
      revealing: false,
    };
  }

  componentDidMount() {
    const { registerActionListener } = this.props;

    this.actionListenerUnregisterers.push(registerActionListener("reveal", this.reveal));
    this.actionListenerUnregisterers.push(registerActionListener("startNewRound", this.startNewRound));
  }

  componentWillUnmount() {
    this.actionListenerUnregisterers.forEach((actionListenerUnregisterer) => {
      actionListenerUnregisterer();
    });
  }

  /* Actions initiated. */

  estimate = (estimate) => {
    this.props.initiateAction("estimate", { estimate }, ({ success, error }) => {
      if (success) this.setState({ error: null, estimate });
      else this.setState({ error });
    });
  };

  /* Actions listened for. */

  reveal = () => {
    this.setState({ revealing: true });
  };

  startNewRound = () => {
    this.setState({ revealing: false, estimate: null });
  };

  /* Render logic. */

  render() {
    return (
      <div className="component-Member">
        <div className="error">{this.state.error}</div>
        <div className="possible-estimates">
          {
            POSSIBLE_ESTIMATES.map((possibleEstimate) => {
              const className = composeClassName({
                selected: this.state.estimate === possibleEstimate,
              });

              return (
                <button
                  key={possibleEstimate}
                  className={className}
                  onClick={() => this.estimate(possibleEstimate)}
                >
                  {possibleEstimate}
                </button>
              );
            })
          }
        </div>
      </div>
    );
  }
}
