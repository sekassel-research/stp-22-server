# REST API

## Rate Limit

All API operations are rate limited.
You cannot send more than **${environment.rateLimit.limit}** HTTP requests
from the same IP address within **${environment.rateLimit.ttl}** seconds.
WebSockets are exempt from this.

## Error Handling

Many operations may produce some kind of error.
They are generally indicated by different HTTP status codes in the 4xx-5xx range.

Error responses typically don't use the same schema as success responses.
To avoid cluttering the endpoints, only the success schema is provided.
The error schema is one of the following:

* [`ValidationErrorResponse`](#model-ValidationErrorResponse) for validation-related Bad Request errors
* [`ErrorResponse`](#model-ErrorResponse) for every other type of error.

Keep in mind that `ErrorResponse` may or may not include the `message` property with additional details.

## Cleanup

The following resources will be deleted automatically under certain conditions.

| A...    | Will be deleted after...                            | If...                                     |
|---------|-----------------------------------------------------|-------------------------------------------|
| User    | ${environment.cleanup.tempUserLifetimeHours} h      | they seem to be for temporary use         |
| Group   | ${environment.cleanup.emptyGroupLifetimeHours} h    | it has no messages                        |
| Game    | ${environment.cleanup.gameLifetimeHours} h          | no members joined or left in the meantime |
| Message | ${environment.cleanup.globalMessageLifetimeHours} h | it was posted in a global channel         |
| Message | ${environment.cleanup.spamMessageLifetimeHours} h   | it appears to be spam                     |
| Message | ${environment.cleanup.orphanMessageLifetimeHours} h | the sender was deleted                    |

## Cascading Deletes

The following table shows which delete operations trigger other deletes.
Cascading deletes are transitive, meaning a cascading deletion can trigger more cascading deletions.
All delete operations, whether manual, cleanup or cascading, trigger the same events.

| Deleting a... | Also deletes...                       |
|---------------|---------------------------------------|
| User          | Games they are the owner of           |
| User          | Their Membership in Games they joined |
| Group         | All Messages sent within the Group    |
| Game          | All Members of the Game               |
| Game          | All Messages sent within the Game     |
| Game          | All Moves of the game                 |

Cascading deletes do not apply to some resources:

* Deleting a User does not delete any of their Messages.
* Deleting a User does not delete any Group in which they are a Member.
