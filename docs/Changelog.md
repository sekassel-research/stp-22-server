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

* The `PATCH /api/v1/users/{id}` endpoint now returns a `409 Conflict` error if the new username is already taken. [STP22SRV-4](https://jira.uniks.de/browse/STP22SRV-4)
* The `User.avatar` property now only accepts http(s) URLs and Data URIs.

# v1.1.0

## New Features

+ Users now have `createdAt` and `updatedAt` properties.
+ Groups may now have a name. [STP22SRV-3](https://jira.uniks.de/browse/STP22SRV-3)

## Improvements

* Games are deleted after two hours of inactivity (delay may be adapted in the future).

## Bugfixes

* Limited the number of Group members to a maximum of 100.
* The `GET /api/v1/groups/{id}` endpoint now returns a `404 Not Found` error if the group can't be found.
* The `DELETE /api/v1/groups/{id}` endpoint now returns a `403 Forbidden` error unless called by the last remaining group member.

# v1.1.1

## Bugfixes

* The `PATCH /api/v1/users/{id}` endpoint no longer sets the status to `offline`. [STP22SRV-5](https://jira.uniks.de/browse/STP22SRV-5)
* The `GET /api/v1/{namespace}/{parent}/messages` endpoint no longer incorrectly returns `400 Bad Request`. [STP22SRV-6](https://jira.uniks.de/browse/STP22SRV-6)
* The `POST /api/v1/auth/refresh` endpoint no longer incorrectly returns `400 Bad Request`. [STP22SRV-7](https://jira.uniks.de/browse/STP22SRV-7)

# v1.1.2

## Improvements

* Empty groups (no messages and no name) are deleted after one hour.
* Temporary users (determined by <span title="aka regex">advanced pattern recognition algorithms</a>) are deleted after one hour.

# v1.1.3

## Improvements

* Preparations for upcoming release, including configurable cleanup and API version.

## Bugfixes

* Group cleanup is now a little less aggressive.

# v1.2.0

## New Features

* Added the `User.friends` property. [STP22SRV-8](https://jira.uniks.de/browse/STP22SRV-8)
* Added the `global` message namespace. [STP22SRV-9](https://jira.uniks.de/browse/STP22SRV-9)
  * It supports multiple channels using any valid ObjectID as `parent`.
  * All global Messages are deleted after 4 hours.
* The `GET /api/v1/{namespace}/{parent}/messages` endpoint now supports the `createdAfter` query parameter.

## Improvements

* Empty groups are now deleted even if they have a custom name.
* Spammy messages are now deleted after an hour.

## Documentation

* Documented when and why resources are deleted for cleanup.

# v1.2.1

## Bugfixes

* Global messages no longer error with `403 Forbidden` due to "inaccessible parent". [STP22SRV-12](https://jira.uniks.de/browse/STP22SRV-12)

# v1.2.2

## Bugfixes

* All `PATCH` endpoint no longer allow `null` values. [STP22SRV-11](https://jira.uniks.de/browse/STP22SRV-11)

# v1.2.3

## Bugfixes

* Fixed cascading deletes potentially failing to work for messages.

# v1.2.4

## Bugfixes

* Fixed private WebSocket events not being delivered.

# v2.0.0 - Pioneers Base Game

## New Features

### Resources

+ Added Game `started` flag.
+ Added Game Map.
+ Added Game Players.
+ Added Game State.
+ Added Game Moves.

### Game Rules

+ Added map features: resource tiles, number tokens
+ Added founding phase.
+ Added main game loop: dice roll, resource retrieval, buying and placing settlements, cities and roads.

## Improvements

* `POST /api/v1/games/{gameId}/members` now returns a `403 Forbidden` error when the password is wrong.

# v2.0.1

## Documentation

* Documented the `CreateMoveDto` `building` property.

## Improvements

* The `Member` `color` can now be updated or set on creation. [STP22SRV-13](https://jira.uniks.de/browse/STP22SRV-13)

## Bugfixes

* Fixed server crash. [STP22SRV-14](https://jira.uniks.de/browse/STP22SRV-14)
* Fixed maps, players and states being deleted when un-starting a game.  [STP22SRV-15](https://jira.uniks.de/browse/STP22SRV-15)
* Fixed cascading deletes potentially failing to work for messages.
* Fixed cascading deletes for buildings, maps, players and states.
* Fixed building creation.

# v2.0.2

## Improvements

* Game cleanup also deletes started games, but the lifetime was increased to four hours.
* Temporary user cleanup is now a little more aggressive.
* Messages whose sender no longer exists are now deleted after an hour.
