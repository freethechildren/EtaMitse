import React, { Component } from "react";

import "./Host.css";

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
        this.setState({ error: null, members });
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
        <ul>
          {
            Object.keys(this.state.members).map((memberID) => {
              const member = this.state.members[memberID];
              return <li key={memberID}>{member.name}{this.state.revealing ? ` said ${member.estimate}` : ""}</li>;
            })
          }
        </ul>
        <button onClick={this.reveal}>Reveal</button>
        <button onClick={this.startNewRound}>Start New Round</button>
      </div>
    );

    // const { clients, revealing } = this.state

    // const clientList = Object.keys(clients).map(clientID => {
    //   const client = clients[clientID]

    //   return (
    //     <li
    //       key={clientID}
    //       className={`client ${
    //         client.estimate !== undefined ? "estimated" : ""
    //       }`}
    //     >
    //       {client.name}
    //       {revealing ? ` said ${client.estimate}` : ""}
    //     </li>
    //   )
    // })

    // return (
    //   <Fragment>
    //     <ul>{clientList}</ul>
    //     <button
    //       className="waves-effect waves-light btn"
    //       onClick={this.newRound}
    //     >
    //       New Round
    //     </button>
    //     <button className="waves-effect waves-light btn" onClick={this.reveal}>
    //       Reveal
    //     </button>
    //   </Fragment>
    // )
  }
}
