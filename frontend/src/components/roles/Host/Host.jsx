import React, { Component } from "react";

import constants from "../../../includes/constants";
import utilities from "../../../includes/utilities";
import "./Host.css";

const { AUTO_REVEAL_GRACE_PERIOD } = constants;
const { delay, composeClassName } = utilities;

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
    const { members } = this.state;
    members[id].estimate = estimate;
    this.setState({ members }, () => this.autoReveal());
  };

  /* Misc. */

  autoReveal = async () => {
    if (!this.state.revealing && this.state.autoReveal) {
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

  onAutoRevealToggle = () => {
    this.setState({ autoReveal: !this.state.autoReveal }, () => this.autoReveal());
  };

  /* Render logic. */

  render() {
    const memberListItems = Object.keys(this.state.members).map((memberID) => {
      const member = this.state.members[memberID];

      const className = composeClassName("member", {
        estimated: "estimate" in member,
      });

      let status = "";
      if (this.state.revealing) {
        if ("estimate" in member) status = `said ${member.estimate}`;
        else status = "did not estimate";
      }

      return (
        <li
          key={memberID}
          className={className}
        >
          {member.name} {status}
        </li>
      );
    });

    const revealingInText = this.state.revealingIn === null ? null : `Revealing in ${this.state.revealingIn}`;

    return (
      <div className="component-Host">
        <div className="error">{this.state.error}</div>
        <ul className="member-list">{memberListItems}</ul>
        <button disabled={this.state.revealing} onClick={this.reveal}>Reveal</button>
        <button onClick={this.startNewRound}>Start New Round</button>
        <label>
          <input type="checkbox" checked={this.state.autoReveal} onClick={this.onAutoRevealToggle} />
          Auto-reveal once everyone has estimated
        </label>
        <p>{revealingInText}</p>
      </div>
    );
  }
}
