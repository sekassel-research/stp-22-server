# v1.0.0 - Auth, Users, Games and Messages

## New Features

### Resources

+ Added Authentication.
+ Added Users.
+ Added Groups.
+ Added Messages.
+ Added Games.
+ Added Game Members.

### Technical

+ Added rate limit.
+ Added event WebSocket.

# v1.0.1

## Bugfixes

* Object IDs in path parameters are properly validated and no longer cause 500 server errors. [STP22SRV-1](https://jira.uniks.de/browse/STP22SRV-1)

# v1.0.2

## Improvements

* `POST /api/v1/users` now returns a `409 Conflict` error instead of the existing user if the username is already taken.
* `POST /api/v1/logout` now returns a `204 No Content` on success.
* Changed the rate limit and made it dynamically configurable.
* Improved documentation for login tokens and WebSocket events.

## Bugfixes

* The rate limit is no longer shared between all clients.

# v1.0.3

## Documentation

* Improved examples for WebSocket event patterns.
* Added a server definition to the OpenAPI spec.
* Documented the `namespace` path parameter for messages.

## Improvements

* Invalid `namespace` path parameters for messages now result in a `400 Bad Request` error.
