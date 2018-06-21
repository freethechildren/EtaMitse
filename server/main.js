const express = require("express")
const SocketServer = require("ws").Server
const path = require("path")

const PORT = process.env.PORT || 8080
const INDEX = path.join(__dirname, "index.html")

const server = express()
  .use((req, res) => res.sendFile(INDEX))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

wss = new SocketServer({ server })

let host = null
let clients = {}
let currentClientID = 0

function send(connection, message) {
  connection.send(JSON.stringify(message))
}

wss.on("connection", connection => {
  console.log("Connection established!")

  let isHost = false
  let clientID
  if (host === null) {
    host = { connection }
    isHost = true
  } else {
    clientID = currentClientID++
    clients[clientID] = { connection }
  }

  send(connection, { clientID })

  connection.on("message", message => {
    const data = JSON.parse(message)
    switch (data.command) {
      case "set_name":
        clients[clientID].name = data.name
        send(host.connection, {
          command: "new_client",
          id: clientID,
          name: data.name
        })
        break
      case "estimate":
        clients[clientID].estimate = data.estimate
        send(host.connection, {
          command: "estimate",
          id: clientID,
          estimate: data.estimate
        })
        break
      case "new_round":
        if (!isHost) break
        Object.keys(clients).forEach(clientID => {
          delete clients[clientID].estimate
          send(clients[clientID].connection, { command: "new_round" })
        })
        break
    }
  })

  connection.on("close", () => {
    if (isHost) {
      host = null
    } else {
      delete clients[clientID]
      send(host.connection, { command: "client_disconnect", id: clientID })
    }
  })
})
