# Asynchronous WebSocket

The asynchronous WebSocket is available under the `/ws/${environment.version}/events` path.
It accepts incoming commands and sends outgoing events.
To receive events, you first need to subscribe to them.

## Authentication

To connect to the WebSocket, you need to authenticate yourself using a JWT.
You can pass the token either via `Authorization: Bearer <Token>` header,
or using the query parameter `authHeader` in the endpoint URL.
Failing to provide a (valid) token will cause the WebSocket to disconnect automatically.

## Commands

The WebSocket supports the following commands:

| Command       | Payload                |
|---------------|------------------------|
| `subscribe`   | Event Pattern (string) |
| `unsubscribe` | Event Pattern (string) |

Commands are sent as JSON, for example:

```json
{"event":"subscribe","data":"games.*.*"}
```

## Events

Events are subscribed to and unsubscribed from using the commands described above.
Each event has a qualified name consisting of one or segments separated by periods (`.`).
You can subscribe to multiple events using qualified names or wildcard patterns, as shown by the following example patterns:

* `games.507f191e810c19729de860ea.created`
  * Matches: `games.507f191e810c19729de860ea.created`
  * Does not match: `games.507f191e810c19729de860ea.updated`, `groups.507f191e810c19729de860ea.created`, `games.60bfe4dff98fef16e696ce6c.created`
* `games.*.created`
  * Matches: `games.507f191e810c19729de860ea.created`, `games.60bfe4dff98fef16e696ce6c.created`
  * Does not match: `games.507f191e810c19729de860ea.updated`, `groups.507f191e810c19729de860ea.created`
* `games.507f191e810c19729de860ea.*`
  * Matches: `games.507f191e810c19729de860ea.created`, `games.507f191e810c19729de860ea.updated`, `games.507f191e810c19729de860ea.deleted`
  * Does not match: `groups.507f191e810c19729de860ea.updated`, `games.60bfe4dff98fef16e696ce6c.deleted`
* `games.*.*`
  * Matches: `games.507f191e810c19729de860ea.created`, `games.60bfe4dff98fef16e696ce6c.updated`, `games.507f191e810c19729de860ea.deleted`, `games.60bfe4dff98fef16e696ce6c.deleted`
  * Does not match: `groups.507f191e810c19729de860ea.updated`

You receive events from the moment you send the `subscribe` command, up until you send the `unsubscribe` command *with the exact same pattern*.
That means it is **not** possible to
a) subscribe with a wilcard pattern and selectively unsubscribe with a more specific pattern, or
b) subscribe with one or more specific pattern and unsubscribe with a wildcard pattern.

All events are automatically unsubscribed when closing the WebSocket connection.

Similar to commands, events are sent as JSON.
However, the payload within the `data` field may contain any JSON value, not just strings.

```json
{"event":"groups.507f191e810c19729de860ea.created","data":{"_id": "507f191e810c19729de860ea", "...": "..."}}
```

The following table shows which events may be sent.
Some events are only visible to certain users for privacy reasons.

| Event Name                                                        | Payload                             | Visible to                                     |
|-------------------------------------------------------------------|-------------------------------------|------------------------------------------------|
| `users.<userId>.{created,updated,deleted}`<sup>1, 2</sup>         | [`User`](#model-User)               | Everyone                                       |
| `groups.<groupId>.{created,updated,deleted}`                      | [`Group`](#model-Group)             | Anyone in the `members` array                  |
| `groups.<groupId>.messages.<messageId>.{created,updated,deleted}` | [`Message`](#model-Message)         | Anyone in the group's `members` array          |
| `games.<gameId>.{created,updated,deleted}`                        | [`Game`](#model-Game)               | Everyone                                       |
| `games.<gameId>.members.<userId>.{created,updated,deleted}`       | [`Member`](#model-Member)           | Everyone                                       |
| `games.<gameId>.messages.<messageId>.{created,updated,deleted}`   | [`Message`](#model-Message)         | Anyone who is a member of the game             |
| `games.<gameId>.map.{created,updated,deleted}`                    | [`Map`](#model-Map)                 | Anyone who is a member of the game             |
| `games.<gameId>.state.{created,updated,deleted}`                  | [`State`](#model-State)             | Anyone who is a member of the game             |
| `games.<gameId>.players.<userId>.{created,updated,deleted}`       | [`Player`](#model-Player)           | Anyone who is a member of the game<sup>3</sup> |
| `games.<gameId>.moves.<moveId>.created`                           | [`Move`](#model-Move)               | Anyone who is a member of the game             |
| `games.<gameId>.buildings.<buildingId>.{created,updated,deleted}` | [`Building`](#model-Building)       | Anyone who is a member of the game             |
| `maps.<mapId>.{created,updated,deleted}`                          | [`MapTemplate`](#model-MapTemplate) | Everyone                                       |
| `maps.<mapId>.votes.<userId>.{created,updated,deleted}`           | [`Vote`](#model-Vote)               | Everyone                                       |

<sup>1</sup>: The shorthand notation `foo.{bar,baz}` means "either `foo.bar` or `foo.baz`" **in this table**. You **cannot** use this notation to subscribe to or unsubscribe from events!

<sup>2</sup>:
The placeholder `<userId>` stands for "some fixed User ID". For example, a possible event could be `users.507f191e810c19729de860ea.updated`.
You can use this to subscribe to events that concern a single resource. If you do want to subscribe to all user events, use the pattern `users.*.*`.
Similarly, to receive all events regarding the member list of a game, you could use the pattern `games.507f191e810c19729de860ea.members.*.*`.

<sup>3</sup>:
The Player who is being updated receives different data from other players.
In particular, they can see the number of their own resources.
Other players receive the total number of resources under the key `unknown`.
