import React, { Fragment, Component } from "react";

import "./Client.css";

const possibleEstimates = [0.5, 1, 2, 3, 5, 8, 13];

export default class Client extends Component {
	constructor(props) {
		super(props);

		this.connection = new WebSocket("ws://127.0.0.1:8080");
		// this.addEventListener("open", )
		this.connection.addEventListener("message", this.onMessage);
    }
    
    estimate = (estimate) => {
    }

	render() {
        const estimateButtons = possibleEstimates.map((possibleEstimate) => (
            <button onClick={() => { this.estimate(possibleEstimate); }}>{possibleEstimate}</button>
        ));

		return (
			<Fragment>
			</Fragment>
		);
	}
}