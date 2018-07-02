require("dotenv").config();

const express = require("express");
const ws = require("ws");
const path = require("path");

const { NETWORK_PORT, POSSIBLE_ESTIMATES } = require("./includes/constants");
const { generateMeetingCode } = require("./includes/utilities");

const meetings = {};

const actionListeners = {
  setName: (client, { name }) => {
    if (typeof name !== "string") {
      return { success: false, error: "Name must be a string." };
    }

    if (name.length === 0) {
      return { success: false, error: "Name cannot be empty." };
    }

    client.name = name;

    return { success: true };
  },

  createMeeting: (client) => {
    if (!("name" in client)) {
      return { success: false, error: "Name must be set before creating a meeting." };
    }

    let code;
    do {
      code = generateMeetingCode();
    } while (code in meetings);

    meetings[code] = {
      code,
      host: client,
      lastMemberID: -1,
      members: {},
    };

    client.meeting = meetings[code];

    return { success: true, code };
  },

  joinMeeting: (client, { code }) => {
    if (!("name" in client)) {
      return { success: false, error: "Name must be set before joining a meeting." };
    }

    if ("meeting" in client) {
      return { success: false, error: "Already in a meeting." };
    }

    if (typeof code !== "number") {
      return { success: false, error: "Code must be a number." };
    }

    if (!(code in meetings)) {
      return { success: false, error: "Meeting does not exist." };
    }

    const meeting = meetings[code];

    let memberID = ++meeting.lastMemberID;
    meeting.members[memberID] = client;
  
    client.meeting = meeting;
    client.memberID = memberID;

    meeting.host.initiateAction("addMember", { id: memberID, name: client.name });

    return { success: true, host: { name: meeting.host.name } };
  },

  leaveMeeting: (client) => {
    if (!("meeting" in client)) {
      return { success: false, error: "Not in a meeting." };
    }

    if (client === client.meeting.host) {
      Object.values(client.meeting.members).forEach((member) => {
        delete member.meeting;
        delete member.memberID;

        member.initiateAction("endMeeting");
      });

      delete meetings[client.meeting.code];
    } else {
      delete client.meeting.members[client.memberID];

      client.meeting.host.initiateAction("removeMember", { id: client.memberID });

      delete client.memberID;
    }

    delete client.meeting;

    return { success: true };
  },

  estimate: (client, { estimate }) => {
    if (!("meeting" in client)) {
      return { success: false, error: "Must be in a meeting to estimate." };
    }

    if (client === client.meeting.host) {
      return { success: false, error: "Hosts cannot estimate." };
    }

    if (typeof estimate !== "number") {
      return { success: false, error: "Estimate must be a number." };
    }

    if (!POSSIBLE_ESTIMATES.includes(estimate)) {
      return { success: false, error: "Invalid estimate." };
    }

    client.meeting.host.initiateAction("estimate", { id: client.memberID, estimate });

    return { success: true };
  },

  reveal: (client) => {
    if (!("meeting" in client)) {
      return { success: false, error: "Must be in a meeting to reveal." };
    }

    if (client !== client.meeting.host) {
      return { success: false, error: "Members cannot reveal." };
    }

    Object.values(client.meeting.members).forEach((member) => {
      member.initiateAction("reveal");
    });

    return { success: true };
  },

  startNewRound: (client) => {
    if (!("meeting" in client)) {
      return { success: false, error: "Must be in a meeting to start a new round." };
    }

    if (client !== client.meeting.host) {
      return { success: false, error: "Members cannot start a new round." };
    }

    Object.values(client.meeting.members).forEach((member) => {
      member.initiateAction("startNewRound");
    });

    return { success: true };
  },
};

const onClientDisconnect = (client) => {
  if ("meeting" in client) actionListeners.leaveMeeting(client);
};

/* Server and protocol logic. */

// HTTP server
const webServer = express()
  .use(express.static(path.join(__dirname, "public/")))
  .listen(NETWORK_PORT, () => console.log(`Listening on *:${NETWORK_PORT}.`));

// WebSocket server
let lastClientID = -1;
(new ws.Server({ server: webServer })).on("connection", (connection, request) => {
  const clientID = ++lastClientID;
  let greatestKnownNonce = 0;
  const reactionListeners = {};
  const client = {
    initiateAction: (action, data = {}, reactionListener) => {
      const nonce = ++greatestKnownNonce;
      if (typeof reactionListener === "function") reactionListeners[nonce] = reactionListener;
      connection.send(JSON.stringify({ nonce, type: "action", payload: { action, data } }));
      console.log(`Initiated an action to client #${clientID} (action: ${action}, nonce: ${nonce}).`);
    },
  };

  console.log(`${request.connection.remoteAddress} connected and named client #${clientID}.`);

  connection.on("message", (message) => {
    const { nonce, type, payload } = JSON.parse(message);

    if (typeof nonce !== "number" || typeof type !== "string" || typeof payload !== "object" || Array.isArray(payload)) return;

    const { data = {} } = payload;

    if (typeof data !== "object" || Array.isArray(data)) return;

    if (nonce > greatestKnownNonce) greatestKnownNonce = nonce;

    switch (type) {
      case "action":
        const { action } = payload;
        
        if (typeof action !== "string") break;

        console.log(`Client #${clientID} initiated an action (action: ${action}, nonce: ${nonce}).`);
        if (action in actionListeners) {
          const reactionData = actionListeners[action](client, data);
          if (typeof reactionData === "object") {
            connection.send(JSON.stringify({ nonce, type: "reaction", payload: { data: reactionData } }));
            console.log(`Reacted to client #${clientID} (nonce: ${nonce}).`);
          }
        }
        break;

      case "reaction":
        console.log(`Client #${clientID} reacted to an action (nonce: ${nonce}).`);
        if (nonce in reactionListeners) {
          reactionListeners[nonce](data);
          delete reactionListeners[nonce];
        }
        break;
    }
  });

  connection.on("close", () => {
    console.log(`Client #${clientID} disconnected.`);
    onClientDisconnect(client);
  });
});
