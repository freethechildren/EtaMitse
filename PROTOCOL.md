# Protocol

## Communication Model
The protocol is built based on two-way client-server communication with there being a single server and multiple clients sending and receiving `message`s to and from that server. The server acts as the single source of truth.

### Message
Each `message` is a JSON-encoded string representing an object. The object must contain these properties:
- `nonce` : a number
- `type`: either `"action"` or `"reaction"`
- `payload`: an object

#### Action
An `action` can be initiated by either party (client or server). The `payload` object must contain these properties:
- `action`: a string
- `data`: an object

#### Reaction
A `reaction` can be sent by either party as a response to a specific initiation of an `action`—indicated through the `nonce`—by the other party. The `payload` object must contain these properties:
- `data`: an object

### Nonce
The party initiating an `action` attaches with it a `nonce` which is used by the other party in its `reaction`. It is the `action`-initiating party's responsibility to ensure that the `nonce` used is strictly greater than every `nonce` that has been previously used within the lifetime of the connection (including `nonce`s associated with `action`s initiated by the other party).
