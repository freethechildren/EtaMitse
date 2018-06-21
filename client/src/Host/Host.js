import React, { Fragment, Component } from "react"

import "./Host.css"

export default class Host extends Component {
  constructor(props) {
    super(props)

    this.state = {
      clients: {},
      revealing: false
    }

    this.connection = new WebSocket("wss://etamitse.herokuapp.com")
    // this.connection = new WebSocket("ws://10.218.40.40:8080");
    // this.addEventListener("open", )
    this.connection.addEventListener("message", this.onMessage)
  }

  onMessage = message => {
    const data = JSON.parse(message.data)
    const { clients } = this.state

    switch (data.command) {
      case "new_client":
        clients[data.id] = { name: data.name }
        break
      case "estimate":
        clients[data.id].estimate = data.estimate
        break
      case "client_disconnect":
        delete clients[data.id]
        break
    }

    this.setState({ clients })
  }

  newRound = () => {
    const { clients } = this.state

    this.connection.send(JSON.stringify({ command: "new_round" }))

    Object.keys(clients).forEach(clientID => {
      delete clients[clientID].estimate
    })

    this.setState({ clients, revealing: false })
  }

  reveal = () => {
    this.setState({ revealing: true })
  }

  render() {
    const { clients, revealing } = this.state

    const clientList = Object.keys(clients).map(clientID => {
      const client = clients[clientID]

      return (
        <li
          key={clientID}
          className={`client ${
            client.estimate !== undefined ? "estimated" : ""
          }`}
        >
          {client.name}
          {revealing ? ` said ${client.estimate}` : ""}
        </li>
      )
    })

    return (
      <Fragment>
        <ul>{clientList}</ul>
        <button
          className="waves-effect waves-light btn"
          onClick={this.newRound}
        >
          New Round
        </button>
        <button className="waves-effect waves-light btn" onClick={this.reveal}>
          Reveal
        </button>
      </Fragment>
    )
  }
}
