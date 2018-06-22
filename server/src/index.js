const express = require("express");
const WebSocket = require("ws");
const path = require("path");

const PORT = process.env.PORT || 8080;
const INDEX = path.join(__dirname, "index.html");

const server = express()
  .use((req, res) => res.sendFile(INDEX))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new WebSocket.Server({ server });

let host = null;
let clients = {};
let currentClientID = 0;

function send(connection, message) {
  connection.send(JSON.stringify(message));
}

wss.on("connection", connection => {
  console.log("Connection established!");

  let isHost = false;
  let clientID;
  if (host === null) {
    host = { connection };
    isHost = true;
  } else {
    clientID = currentClientID++;
    clients[clientID] = { connection };
  }

  send(connection, { clientID });

  connection.on("message", message => {
    const data = JSON.parse(message);
    switch (data.action) {
      case "setName":
        send(connection, {
          type: "response",
          success: true,
          nonce: data.nonce,
        });
        break;
      case "set_name":
        clients[clientID].name = data.name;
        send(host.connection, {
          command: "new_client",
          id: clientID,
          name: data.name,
        });
        send(connection, {
          command: "set"
        });
        break;
      case "estimate":
        clients[clientID].estimate = data.estimate;
        send(host.connection, {
          command: "estimate",
          id: clientID,
          estimate: data.estimate,
        });
        break;
      case "new_round":
        if (!isHost) break;
        Object.keys(clients).forEach(clientID => {
          delete clients[clientID].estimate;
          send(clients[clientID].connection, { command: "new_round" });
        });
        break;
    }
  });

	connection.on('close', () => {
		if (isHost) {
			host = null;
			Object.keys(clients).forEach((clientID) => {
				clients[clientID].connection.close();
			});
			clients = {};
		} else {
			delete clients[clientID];
			send(host.connection, { command: "client_disconnect", id: clientID });
		}
	});
});
