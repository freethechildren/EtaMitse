import React, { Component } from "react";

import utilities from "../../../utilities";
import "./Host.css";

const { composeClassName } = utilities;

export default class Host extends Component {
  /* Instance fields. */

  actionListenerUnregisterers = [];

  /* React lifecycle. */

  constructor(props) {
    super(props);

    this.state = {
      error: null,
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
          member.estimate = null;
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
    members[id] = { name, estimate: null };
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
    this.setState({ members });
  };

  /* Render logic. */

  render() {
    return (
      <div className="component-Host">
        <div className="error">{this.state.error}</div>
        <ul className="member-list">
          {
            Object.keys(this.state.members).map((memberID) => {
              const member = this.state.members[memberID];

              const className = composeClassName("member", {
                estimated: member.estimate !== null,
              });

              let status = "";
              if (this.state.revealing) {
                if (member.estimate !== null) status = `said ${member.estimate}`;
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
            })
          }
        </ul>
        <button onClick={this.reveal}>Reveal</button>
        <button onClick={this.startNewRound}>Start New Round</button>
      </div>
    );
  }
}
