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

    // const { name, isNameSet, currentEstimate, revealed } = this.state

    // if (!isNameSet) {
    //   return (
    //     <Fragment>
    //       <input
    //         type="text"
    //         placeholder="Enter your name"
    //         onChange={event => {
    //           this.setState({ name: event.target.value })
    //         }}
    //       />
    //       <button
    //         className="waves-effect waves-light btn"
    //         onClick={this.setName}
    //       >
    //         Send
    //       </button>
    //     </Fragment>
    //   )
    // } else {
    //   const estimateButtons = POSSIBLE_ESTIMATES.map(possibleEstimate => (
    //     <button
    //       className="waves-effect waves-light btn"
    //       key={possibleEstimate}
    //       onClick={() => {
    //         this.estimate(possibleEstimate)
    //       }}
    //     >
    //       {possibleEstimate}
    //     </button>
    //   ))

    //   let status
    //   if (revealed) {
    //     if (currentEstimate === null) {
    //       status = "You didn't estimate this round. 😞"
    //     } else {
    //       status = `You estimated a ${currentEstimate}`
    //     }
    //   } else {
    //     if (currentEstimate === null) {
    //       status = "New round! Estimate."
    //     } else {
    //       status = `You're currently estimating a ${currentEstimate}.`
    //     }
    //   }

    //   return (
    //     <Fragment>
    //       <div>Hey, {name}!</div>
    //       {estimateButtons}
    //       <div>{status}</div>
    //     </Fragment>
    //   )
    // }
  }
}
