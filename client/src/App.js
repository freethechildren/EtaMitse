import React, { Fragment, Component } from "react"

import Client from "./Client/Client"
import Host from "./Host/Host"

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      mode: ""
    }
  }

  setMode = mode => {
    this.setState({ mode })
  }

  render() {
    const { mode } = this.state

    switch (mode) {
      case "client":
        return <Client />
        break
      case "host":
        return <Host />
        break
      default:
        return (
          <Fragment>
            <button
              className="waves-effect waves-light btn"
              onClick={() => this.setMode("host")}
            >
              Host
            </button>
            <button
              className="waves-effect waves-light btn"
              onClick={() => this.setMode("client")}
            >
              Client
            </button>
          </Fragment>
        )
        break
    }
  }
}

export default App
