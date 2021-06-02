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
{"event":"message.created","data":{"_id": "507f191e810c19729de860ea", "...": "..."}}
```

The following table shows which events may be sent.
Some events are only visible to certain users for privacy reasons.

| Event Name | Payload | Visible to |
| --- | --- | --- |
| `user.{online,offline}`<sup>1</sup> | [`User`](#model-User) | Everyone |
| `group.{created,updated,deleted}` | [`Group`](#model-Group) | Anyone in the `members` array |
| `message.{created,updated,deleted}` | [`Message`](#model-Message) | Everyone |
| `game.{created,updated,deleted}` | [`Game`](#model-Game) | Everyone |
| `game.<gameId>.member.{created,updated,deleted}`<sup>2</sup> | [`Member`](#model-Member) | Everyone |

<sup>1</sup>: The shorthand notation `foo.{bar,baz}` means "either `foo.bar` or `foo.baz`" **in this table**. You **cannot** use this notation to subscribe to or unsubscribe from events!

<sup>2</sup>: The placeholder `<gameId>` stands for "some fixed Game ID". For example, a possible event could be `game.507f191e810c19729de860ea.member.created`. You can use this to subscribe only to events within a game you are currently part of, instead of receiving events from every game. If you do want events from every game, use the pattern `game.*.member.created`.
