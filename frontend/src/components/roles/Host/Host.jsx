import React, { Component, Fragment } from "react";
import {
  Typography,
  FormControlLabel,
  Checkbox,
  Switch,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";

import "./Host.css";
import constants from "../../../includes/constants";
import utilities from "../../../includes/utilities";

const { AUTO_REVEAL_GRACE_PERIOD, ESTIMATES_MEAN_DECIMAL_PRECISION } = constants;
const { delay } = utilities;

export default class Host extends Component {
  /* Instance fields. */

  actionListenerUnregisterers = [];

  /* React lifecycle. */

  constructor(props) {
    super(props);

    this.state = {
      error: null,
      autoReveal: false,
      revealingIn: null,
      revealing: false,
      members: {},
    };
  }

  componentDidMount() {
    const { registerActionListener } = this.props;

    this.actionListenerUnregisterers.push(registerActionListener("addMember", this.addMember));
    this.actionListenerUnregisterers.push(registerActionListener("removeMember", this.removeMember));
    this.actionListenerUnregisterers.push(registerActionListener("estimate", this.estimate));
  }

  componentWillUnmount() {
    this.actionListenerUnregisterers.forEach((actionListenerUnregisterer) => {
      actionListenerUnregisterer();
    });
  }

  /* Actions initiated. */

  reveal = () => {
    this.props.initiateAction("reveal", {}, ({ success, error }) => {
      if (success) {
        this.setState({ error: null, revealing: true });
      } else {
        this.setState({ error });
      }
    });
  };

  startNewRound = () => {
    this.props.initiateAction("startNewRound", {}, ({ success, error }) => {
      if (success) {
        const { members } = this.state;
        Object.values(members).forEach((member) => {
          delete member.estimate;
        });
        this.setState({ error: null, revealing: false, members });
      } else {
        this.setState({ error });
      }
    });
  };

  /* Actions listened for. */

  addMember = ({ id, name }) => {
    const { members } = this.state;
    members[id] = { name };
    this.setState({ members });
  };

  removeMember = ({ id }) => {
    const { members } = this.state;
    delete members[id];
    this.setState({ members });
  };

  estimate = ({ id, estimate }) => {
    if (this.state.revealing) return;

    const { members } = this.state;
    members[id].estimate = estimate;
    this.setState({ members }, () => this.autoReveal());
  };

  /* Misc. */

  autoReveal = async () => {
    if (!this.state.revealing && this.state.autoReveal && Object.keys(this.state.members).length > 0) {
      const hasEveryMemberEstimated = Object.values(this.state.members).every((member) => "estimate" in member);
      if (hasEveryMemberEstimated) {
        for (let i = AUTO_REVEAL_GRACE_PERIOD; i > 0; i--) {
          this.setState({ revealingIn: i });
          await delay(1000);
        }
        this.setState({ revealingIn: null });
        this.reveal();
      }
    }
  };

  toggleReveal = () => {
    if (!this.state.revealing) {
      this.reveal();
    } else {
      this.startNewRound();
    }
  };

  toggleAutoReveal = () => {
    this.setState({ autoReveal: !this.state.autoReveal }, () => this.autoReveal());
  };

  /* Render logic. */

  render() {
    let numberOfMembersWhoEstimated = 0;
    let estimatesSum = 0;
    const estimatesCount = {};

    const memberListItems = Object.keys(this.state.members).map((memberID) => {
      const member = this.state.members[memberID];

      let color = "error";
      if ("estimate" in member) {
        color = "primary";

        numberOfMembersWhoEstimated++;
        estimatesSum += member.estimate;
        if (!(member.estimate in estimatesCount)) {
          estimatesCount[member.estimate] = 0;
        }
        estimatesCount[member.estimate]++;
      }

      let status = null;
      if (this.state.revealing) {
        if ("estimate" in member) status = `said ${member.estimate}`;
        else status = "did not estimate";
      }

      return (
        <ListItem key={memberID}>
          <ListItemText
            primary={<Typography variant="title" color={color} align="right">{member.name} {status}</Typography>}
          />
        </ListItem>
      );
    });

    const estimatesMean = numberOfMembersWhoEstimated > 0 ? estimatesSum / numberOfMembersWhoEstimated : 0;
    const estimatesMode = Object.keys(estimatesCount).reduce((currentMode, estimate) => {
      if (currentMode === null || estimatesCount[estimate] > estimatesCount[currentMode]) return estimate;
      else return currentMode;
    }, null);

    const memberList = memberListItems.length === 0 ? (
      <Typography variant="body2">Nobody is here at the moment.</Typography>
    ) : (
      <List>{memberListItems}</List>
    );

    const revealingInText = this.state.revealingIn === null ? null : `Revealing in ${this.state.revealingIn}`;

    const roundedEstimatesMean = Math.round(estimatesMean * (10 ** ESTIMATES_MEAN_DECIMAL_PRECISION)) / 10 ** ESTIMATES_MEAN_DECIMAL_PRECISION;
    const resultText = this.state.revealing && numberOfMembersWhoEstimated > 0 ? (
      <Fragment>
        Mode: {estimatesMode}<br />
        Mean: {roundedEstimatesMean}
      </Fragment>
    ) : null;

    return (
      <div className="component-Host">
        <Typography variant="subheading" gutterBottom color="error">{this.state.error}</Typography>
        <Typography variant="headline" gutterBottom color="secondary">{resultText}</Typography>
        <div className="member-list">{memberList}</div>
        <Typography variant="caption" gutterBottom>{revealingInText}</Typography>
        <FormControlLabel
          checked={this.state.revealing}
          onChange={this.toggleReveal}
          control={<Switch color="primary" />}
          label="Reveal estimates"
        />
        <div>
          <FormControlLabel
            checked={this.state.autoReveal}
            onChange={this.toggleAutoReveal}
            control={<Checkbox color="primary" />}
            label="Auto-reveal once everyone has estimated"
          />
        </div>
      </div>
    );
  }
}
