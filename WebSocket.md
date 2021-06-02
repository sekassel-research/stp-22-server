### Asynchronous WebSocket

The asynchronous WebSocket is available under the `/ws` path.
It accepts incoming commands and sends outgoing events.
To receive events, you first need to subscribe to them.

#### Authentication

To connect to the WebSocket, you need to authenticate yourself using a JWT.
You can pass the token either via `Authorization: Bearer <Token>` header,
or using the query parameter `authHeader` in the endpoint URL.
Failing to provide a (valid) token will cause the WebSocket to disconnect automatically.

#### Commands

The WebSocket supports the following commands:

| Command | Payload |
| --- | --- |
| `subscribe` | Event Pattern (string) |
| `unsubscribe` | Event Pattern (string) |

Commands are sent as JSON, for example:

```json
{"event":"subscribe","data":"game.*"}
```

#### Events

Events are subscribed to and unsubscribed from using the commands described above.
Each event has a qualified name consisting of one or segments separated by periods (`.`).
You can subscribe to multiple events using qualified names or wildcard patterns, as described in the following table:

| Event Pattern | Matches (Examples) | Does not match (Examples) |
| --- | --- | --- |
| `message` | `message` | `message.updated`, `message.created`, `game.created` |
| `message.created` | `message.created` | `message`, `message.updated`, `game.created` |
| `message.*` | `message.created`, `message.updated`, `message.deleted` | `message`, `game`, `game.created` |
| `*.created` | `message.created`, `game.created` | `message`, `message.updated`, `game.deleted` |
| `message.**` | `message.created`, `message.created.error`, `message.deleted` | `message`, `game`, `game.created` |
| `**` | Every event | N/A |

You receive events from the moment you send the `subscribe` command, up until you send the `unsubscribe` command *with the same pattern*.
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

| Event Name | Payload | Visible to |
| --- | --- | --- |
| `users.<userId>.{online,offline}`<sup>1, 2</sup> | [`User`](#model-User) | Everyone |
| `groups.<groupId>.{created,updated,deleted}` | [`Group`](#model-Group) | Anyone in the `members` array |
| `games.<gameId>.{created,updated,deleted}` | [`Game`](#model-Game) | Everyone |
| `games.<gameId>.members.<userId>.{created,updated,deleted}` | [`Member`](#model-Member) | Everyone |
| `groups.<gameId>.messages.<messageId>.{created,updated,deleted}` | [`Message`](#model-Message) | Anyone in the group's `members` array |
| `games.<gameId>.messages.<messageId>.{created,updated,deleted}` | [`Message`](#model-Message) | Anyone who is a member of the game |

<sup>1</sup>: The shorthand notation `foo.{bar,baz}` means "either `foo.bar` or `foo.baz`" **in this table**. You **cannot** use this notation to subscribe to or unsubscribe from events!

<sup>2</sup>:
The placeholder `<userId>` stands for "some fixed User ID". For example, a possible event could be `users.3fa85f64-5717-4562-b3fc-2c963f66afa6.online`.
You can use this to subscribe to events that concern a single resource. If you do want to subscribe to all user events, use the pattern `users.*.*`.
Similarly, to receive all events regarding the member list of a game, you could use the pattern `games.507f191e810c19729de860ea.members.*`.
