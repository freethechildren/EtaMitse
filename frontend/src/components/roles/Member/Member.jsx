import React, { Component } from "react";
import { Typography, Button } from "@material-ui/core";

import "./Member.css";
import constants from "../../../includes/constants";
import utilities from "../../../includes/utilities";

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
    const estimateButtons = POSSIBLE_ESTIMATES.map((possibleEstimate) => {
      return (
        <Button
          key={possibleEstimate}
          onClick={() => this.estimate(possibleEstimate)}
          fullWidth
          variant={this.state.estimate === possibleEstimate ? "raised" : "outlined"}
          color="primary"
          disabled={this.state.revealing}
        >
          {possibleEstimate}
        </Button>
      );
    });

    return (
      <div className="component-Member">
        <Typography variant="subheading" gutterBottom color="error">{this.state.error}</Typography>
        <div>{estimateButtons}</div>
      </div>
    );
  }
}
