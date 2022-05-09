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
* `POST /api/v1/logout` now returns `204 No Content` on success.
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

# v1.0.4

## Bugfixes

* Login no longer allows incorrect passwords. [STP22SRV-2](https://jira.uniks.de/browse/STP22SRV-2)
* `POST /api/v1/games/{gameId}/members` now returns a `401 Unauthorized` error when the password is wrong.
* `POST /api/v1/games/{gameId}/members` now returns a `409 Conflict` error when the user has already joined the game.

# v1.0.5

## Documentation

* The `POST /api/v1/users` endpoint no longer incorrectly reports the body in the `409 Conflict` error case as `User`.

## Bugfixes

* The `PATCH /api/v1/users/{id}` endpoint now returns a `409 Conflict` error if the new username is already taken.
* The `User.avatar` property now only accepts http(s) URLs and Data URIs.

# v1.1.0

## New Features

+ Users now have `createdAt` and `updatedAt` properties.
+ Groups may now have a name.

## Improvements

* Games are deleted after two hours of inactivity (delay may be adapted in the future).

## Bugfixes

* Limited the number of Group members to a maximum of 100.
* The `GET /api/v1/groups/{id}` endpoint now returns a `404 Not Found` error if the group can't be found.
* The `DELETE /api/v1/groups/{id}` endpoint now returns a `403 Forbidden` error unless called by the last remaining group member.
