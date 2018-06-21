import React, { Fragment, Component } from "react"

import "./Client.css"

const POSSIBLE_ESTIMATES = [0.5, 1, 2, 3, 5, 8, 13]

export default class Client extends Component {
  constructor(props) {
    super(props)

    this.state = {
      name: "",
      isNameSet: false,
      currentEstimate: null,
      revealed: false
    }

    this.connection = new WebSocket("wss://etamitse.herokuapp.com")
    this.connection.addEventListener("message", this.onMessage)
  }

  setName = () => {
    const { name } = this.state
    this.connection.send(JSON.stringify({ command: "set_name", name }))
    this.setState({ isNameSet: true })
  }

  estimate = estimate => {
    this.connection.send(JSON.stringify({ command: "estimate", estimate }))
  }

  render() {
    const { name, isNameSet, currentEstimate, revealed } = this.state

    if (!isNameSet) {
      return (
        <Fragment>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={event => {
              this.setState({ name: event.target.value })
            }}
          />
          <button
            className="waves-effect waves-light btn"
            onClick={this.setName}
          >
            Send
          </button>
        </Fragment>
      )
    } else {
      const estimateButtons = POSSIBLE_ESTIMATES.map(possibleEstimate => (
        <button
          className="waves-effect waves-light btn"
          key={possibleEstimate}
          onClick={() => {
            this.estimate(possibleEstimate)
          }}
        >
          {possibleEstimate}
        </button>
      ))

      let status
      if (revealed) {
        if (currentEstimate === null) {
          status = "You didn't estimate this round. 😞"
        } else {
          status = `You estimated a ${currentEstimate}`
        }
      } else {
        if (currentEstimate === null) {
          status = "New round! Estimate."
        } else {
          status = `You're currently estimating a ${currentEstimate}.`
        }
      }

      return (
        <Fragment>
          <div>Hey, {name}!</div>
          {estimateButtons}
          <div>{status}</div>
        </Fragment>
      )
    }
  }
}
