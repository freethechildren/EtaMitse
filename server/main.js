const Server = require('websocket').server;
const http = require('http');
 
const httpServer = http.createServer(function(request, response) {
	console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});

httpServer.listen(8080, function() {
	console.log((new Date()) + ' Server is listening on port 8080');
});
 
const server = new Server({
	httpServer: httpServer,
	autoAcceptConnections: true,
});

let host = null;
let clients = {};
let currentClientID = 0;

function send(connection, message) {
	connection.sendUTF(JSON.stringify(message));
}
 
server.on('connect', (connection) => {  
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

	connection.on('message', (message) => {
		if (message.type === 'utf8') {
			const data = JSON.parse(message.utf8Data);
			switch (data.command) {
				case "set_name":
					clients[clientID].name = data.name;
					send(host.connection, { command: "new_client", id: clientID, name: data.name });
					break;
				case "estimate":
					clients[clientID].estimate = data.estimate;
					send(host.connection, { command: "estimate", id: clientID, estimate: data.estimate });
					break;
				case "new_round":
					if (!isHost) break;
					Object.keys(clients).forEach((clientID) => {
						delete clients[clientID].estimate;
						send(clients[clientID].connection, { command: "new_round" });
					});
					break;
			}
		}
	});

	connection.on('close', () => {
		if (isHost) {
			host = null;
		} else {
			delete clients[clientID];
			send(host.connection, { command: "client_disconnect", id: clientID });
		}
	});
});