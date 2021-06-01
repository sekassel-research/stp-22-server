### Asynchronous WebSocket

The asynchronous WebSocket is available under the `/ws` path.
It accepts incoming commands and sends outgoing events.
To receive events, you first need to subscribe to them.

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

The following events may be sent:

| Event Name | Payload |
| --- | --- |
| `user.{online,offline}`<sup>1</sup> | [`User`](#model-User) | 
| `message.{created,updated,deleted}` | [`Message`](#model-Message) | 
| `game.{created,updated,deleted}` | [`Game`](#model-Game) | 
| `member.{created,updated,deleted}` | [`Member`](#model-Member) |

<sup>1</sup>: The shorthand notation `foo.{bar,baz}` means "either `foo.bar` or `foo.baz`" **in this table**. You **cannot** use this notation to subscribe to or unsubscribe from events!
