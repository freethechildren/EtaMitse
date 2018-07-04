import React, { Component, Fragment } from "react"
import { CssBaseline, Typography, Button } from "@material-ui/core";

import "./App.css";
import constants from "./includes/constants";
import { SingleInputForm } from "./components/common";
import { Host, Member } from "./components/roles";

const { SERVER_URL } = constants;

export default class App extends Component {
  /* Instance fields. */

  actionListeners = {};
  greatestKnownNonce = 0;
  reactionListeners = {};
  actionListenerUnregisterers = [];

  /* React lifecycle. */

  constructor(props) {
    super(props);

    this.state = {
      connection: null,
      error: null,
      name: null,
      meeting: null,
    };
  }

  componentDidMount() {
    this.connect();

    this.actionListenerUnregisterers.push(this.registerActionListener("endMeeting", this.endMeeting));
  }

  componentWillUnmount() {
    const { connection } = this.state;
    connection.removeEventListener("message", this.onMessage);
    connection.removeEventListener("close", this.onDisconnect);
    connection.close();

    this.actionListenerUnregisterers.forEach((actionListenerUnregisterer) => {
      actionListenerUnregisterer();
    });
  }

  /* Connection and protocol logic. */

  connect = () => {
    const connection = new WebSocket(SERVER_URL);
    connection.addEventListener("open", () => {
      this.greatestKnownNonce = 0;
      this.reactionListeners = {};
      this.setState({ connection }, () => {
        this.state.connection.addEventListener("message", this.onMessage);
        this.state.connection.addEventListener("close", this.onDisconnect);
      });
    });
  };

  onMessage = ({ data: message }) => {
    const { nonce, type, payload } = JSON.parse(message);
    const { data = {} } = payload;

    if (nonce > this.greatestKnownNonce) this.greatestKnownNonce = nonce;

    // eslint-disable-next-line default-case
    switch (type) {
      case "action":
        const { action } = payload;
        console.log(`Server initiated an action (action: ${action}, nonce: ${nonce}).`);
        if (action in this.actionListeners) {
          const reactionData = this.actionListeners[action](data);
          if (typeof reactionData === "object" && this.state.connection !== null) {
            this.state.connection.send(JSON.stringify({ nonce, type: "reaction", payload: { data: reactionData } }));
          }
        }
        break;

      case "reaction":
        console.log(`Server reacted to an action (nonce: ${nonce}).`);
        if (nonce in this.reactionListeners) {
          this.reactionListeners[nonce](data);
          delete this.reactionListeners[nonce];
        }
        break;
    }
  };

  onDisconnect = () => {
    this.state.connection.removeEventListener("message", this.onMessage);
    this.state.connection.removeEventListener("close", this.onDisconnect);
    this.setState({ connection: null, error: null, name: null, meeting: null });
    this.connect();
  };

  initiateAction = (action, data = {}, reactionListener) => {
    if (this.state.connection === null) return;

    const nonce = ++this.greatestKnownNonce;
    if (typeof reactionListener === "function") this.reactionListeners[nonce] = reactionListener;
    this.state.connection.send(JSON.stringify({ nonce, type: "action", payload: { action, data } }));
    console.log(`Initiated an action (action: ${action}, nonce: ${nonce}).`);
  };

  registerActionListener = (action, actionListener) => {
    this.actionListeners[action] = actionListener;
    return () => delete this.actionListeners[action];
  };

  /* Actions initiated. */

  setName = (name) => {
    this.initiateAction("setName", { name }, ({ success, error }) => {
      if (success) this.setState({ error: null, name });
      else this.setState({ error });
    });
  };

  createMeeting = () => {
    this.initiateAction("createMeeting", {}, ({ success, error, code }) => {
      if (success) this.setState({ error: null, meeting: { code, role: "host" } });
      else this.setState({ error });
    });
  };

  joinMeeting = (code) => {
    this.initiateAction("joinMeeting", { code }, ({ success, error, host }) => {
      if (success) this.setState({ error: null, meeting: { code, role: "member", host }});
      else this.setState({ error });
    });
  };

  leaveMeeting = () => {
    this.initiateAction("leaveMeeting", {}, ({ success, error }) => {
      if (success) this.setState({ error: null, meeting: null });
      else this.setState({ error });
    });
  };

  /* Actions listened for. */

  endMeeting = () => {
    this.setState({ error: "The meeting you were in has ended.", meeting: null });
  };

  /* Render logic. */

  renderStatus = () => {
    if (this.state.connection === null) {
      return "(Re)connecting to server...";
    }

    if (this.state.name === null) {
      return "Please enter your name to get started.";
    }

    if (this.state.meeting === null) {
      return `Welcome, ${this.state.name}!`;
    }

    // eslint-disable-next-line default-case
    switch (this.state.meeting.role) {
      case "host":
        return `${this.state.name}'s meeting (${this.state.meeting.code})`;

      case "member":
        return `${this.state.meeting.host.name}'s meeting (${this.state.meeting.code})`;
    }

    return null;
  }

  renderContent = () => {
    if (this.state.connection === null) {
      return null;
    }

    if (this.state.name === null) {
      return (
        <SingleInputForm
          type="text"
          placeholder="Name"
          buttonText="Submit"
          onSubmit={this.setName}
          error={this.state.error !== null}
        />
      );
    }

    if (this.state.meeting === null) {
      return (
        <Fragment>
          <div className="create-meeting">
            <Typography variant="title" gutterBottom>Host a meeting</Typography>
            <Button onClick={this.createMeeting} variant="raised" color="primary">Create meeting</Button>
          </div>
          <div>
            <Typography variant="title" gutterBottom>Join a meeting</Typography>
            <SingleInputForm
              type="number"
              placeholder="Meeting code"
              buttonText="Go"
              buttonVariant="fab"
              onSubmit={this.joinMeeting}
              error={this.state.error !== null}
            />
          </div>
        </Fragment>
      );
    }

    let roleComponent = null;
    const roleComponentProps = {
      initiateAction: this.initiateAction,
      registerActionListener: this.registerActionListener,
    };

    // eslint-disable-next-line default-case
    switch (this.state.meeting.role) {
      case "host":
        roleComponent = <Host {...roleComponentProps} />;
        break;

      case "member":
        roleComponent = <Member {...roleComponentProps} />;
        break;
    }

    return (
      <Fragment>
        <div className="role">{roleComponent}</div>
        <Button onClick={this.leaveMeeting} variant="raised" color="secondary">Leave Meeting</Button>
      </Fragment>
    );
  }

  render() {
    return (
      <div className="component-App">
        <CssBaseline />
        <div className="container">
          <Typography variant="display1" gutterBottom>{this.renderStatus()}</Typography>
          <Typography variant="subheading" gutterBottom color="error">{this.state.error}</Typography>
          <div className="content">{this.renderContent()}</div>
        </div>
      </div>
    );
  }
}
