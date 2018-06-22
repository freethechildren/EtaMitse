import React, { Fragment, Component } from "react"

import constants from "./constants";
import utilities from "./utilities"
import roles from "./roles";

const { SERVER_URL } = constants;
const s = JSON.stringify;

class App extends Component {
  constructor(props) {
    super(props)

		this.state = {
      connection: null,
      hasNameBeenSet: false,
      name: null,
			roleName: null,
    };

    this.listeners = [];
  }

  componentDidMount() {
    this.connectToServer();
  }

  componentWillUnmount() {
    const { connection } = this.state;
    connection.removeEventListener("message", this.onMessageFromServer);
    connection.removeEventListener("close", this.onDisconnectFromServer);
    connection.close();
  }

  connectToServer = () => {
    const connection = new WebSocket(SERVER_URL);
    connection.addEventListener("open", () => {
      this.setState({ connection }, () => {
        this.state.connection.addEventListener("message", this.onMessageFromServer);
        this.state.connection.addEventListener("close", this.onDisconnectFromServer);
      });
    });
  }

  onMessageFromServer = ({ data: message }) => {
    const { nonce, type, ...data } = JSON.parse(message);

    switch (type) {
      case "action":
        // TODO
        break;
      case "response":
        if (nonce >= 0 && nonce < this.listeners.length) {
          this.listeners[nonce](data);
        }
        break;
    }
  };

  onDisconnectFromServer = () => {
    this.state.connection.removeEventListener("message", this.onMessageFromServer);
    this.state.connection.removeEventListener("close", this.onDisconnectFromServer);
    this.setState({ connection: null, hasNameBeenSet: false });
    this.connectToServer();
  }

  initiateActionToServer = (action, data = {}, listener = () => {}) => {
    const { connection } = this.state;

    if (connection === null) return;

    const nonce = this.listeners.length;
    this.listeners.push(listener);
    connection.send(s({ ...data, nonce, type: "action", action }));
  }

  setName = (name) => {
    this.initiateActionToServer("setName", { name });
    this.setState({ hasNameBeenSet: true, name });
  }

  startNewMeeting = () => {
  }

  joinExistingMeeting = (meetingID) => {
  }

	render() {
    if (this.state.connection === null) {
      return (
        <div className="app-status">
          (Re)connecting to server...
        </div>
      );
    } else {
      if (!this.state.hasNameBeenSet) {
        return (
          <Fragment>
            <input
                type="text"
                placeholder="Enter your name"
                onChange={({ target: { value: name }}) => {
                    this.setState({ name });
                }}
            />
            <button onClick={() => {
              this.setName(this.state.name);
            }}>Confirm</button>
          </Fragment>
        );
      } else {
        if (this.state.roleName === null) {
          return (
            <Fragment>
              {
                Object.keys(roles).map((roleName) => (
                  <button onClick={() => {
                    console.log(roleName);
                    this.setState({ roleName });
                  }}>
                    {roleName}
                  </button>
                ))
              }
            </Fragment>
          );
        } else {
          return React.createElement(this.state.roleName);
        }
      }
    }
	}
}

export default App
