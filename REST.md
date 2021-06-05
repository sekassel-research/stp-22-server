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
