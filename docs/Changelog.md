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

# v2.0.3

## Improvements

* Group members may now update the group to remove themselves.

## Bugfixes

* Games are now actually deleted when the owner is deleted.
* Fixed a problem that caused map, player and state creation on game start to crash.
* Fixed a few potential problems by using stricter type checks.

# v2.0.4

## Bugfixes

* Fixed a problem that caused state creation on game start to crash.

# v2.0.5

## Documentation

* Documented the proper type for the `Member` `color` property.

## Bugfixes

* Fixed a `500 Internal Server Error` when attempting to build on an invalid side.
* The `CreateMoveDto` `building` property is now properly validated.

# v3.0.0

## New Features

### General Game Logic

+ Added the `Game` `settings` property including `mapRadius` and `victoryPoints`.
+ Added the `Member` `spectator` property.
+ Added the `Player` `active` property. [STP22SRV-19](https://jira.uniks.de/browse/STP22SRV-19)
+ Added new endpoints for getting a history of `Move`s.

### Trade

+ Added the `Map` `harbors` property.
+ Added the `Player` `previousTradeOffer` property.
+ Added the `Move` `resources` which triggers a trade when used with the `build` action.
+ Added the `trade` and `offer` actions property.
+ Added the `accept` action and the `Move` `partner` property.

### Robber

+ Added the `State` `robber` property.
+ Added the `drop` action and the `Move` `resources` property.
+ Added the `rob` action and the `Move` `rob` property.

### Victory Points

+ Added the `Player` `victoryPoints` property.
+ Added the `Player` `longestRoad` property.

# v3.0.1

## Bugfixes

* Added the `Game` `settings` to `CreateGameDto` and `UpdateGameDto`. [STP22SRV-23](https://jira.uniks.de/browse/STP22SRV-23)
* Added an additional check for `founding-road-2` to be placed next to the second settlement. [STP22SRV-22](https://jira.uniks.de/browse/STP22SRV-22)
* Fixed an issue that would check positions of buildings across games.

# v3.1.0

## New Features

+ Added `Achievement`s and corresponding endpoints. [STP22SRV-24](https://jira.uniks.de/browse/STP22SRV-24)
+ Added `Achievement` summary endpoints.

## Improvements

* Game owners may now remove spectators while the game is running. [STP22SRV-26](https://jira.uniks.de/browse/STP22SRV-26)
* The `RobDto` `target` may now be optional when robbing a tile without an adjacent player building. [STP22SRV-27](https://jira.uniks.de/browse/STP22SRV-27)

# v3.1.1

## Improvements

* The `Player` `victoryPoints` property is no longer hidden/`0` for other players.

## Bugfixes

* It is no longer possible to build things without sufficient resources.

# v3.1.2

## Bugfixes

* Harbors at sides `1`, `5` and `9` now properly check for adjacent buildings. [STP22SRV-28](https://jira.uniks.de/browse/STP22SRV-28)
* The `trade` and `rob` actions now use `403 Forbidden` and `404 Not Found` instead of `400 Bad Request` for most error cases.
* It is now forbidden to rob yourself by setting `target` to your own ID.

# v3.2.0

## New Features

+ Trades offers can now be send to a specific player using `build` and `target`. [STP22SRV-29](https://jira.uniks.de/browse/STP22SRV-29)

## Bugfixes

* Fixed a `500 Internal Server Error` when attempting to move when `expectedMoves` is empty.

# v3.2.1

## Bugfixes

* The Achievement endpoints now properly include the `id` property. [STP22SRV-30](https://jira.uniks.de/browse/STP22SRV-30)
* Reduced the number of generated harbors to omit one at every fourth outer hexagon (the default map now has 9 harbors as usual).

# v4.0.0

## New Features

+ Added Map Templates.
+ Added Map Template Votes.
+ Added the `maps` message namespace.
+ Added the `Move` `developmentCard` property and functionality for development cards.
+ Added the `Player` `developmentCards` property.
+ Added the `monopoly`, `year-of-plenty` and `road-building` actions.
+ Added the `GameSettings` `roll7` property.
+ Added the `GameSettings` `startingResources` property.

## Improvements

* The `Player` `longestRoad` property is now always updated.
* Robbing a tile with adjacent players without specifying a target is now allowed if none of the players has any resources. [STP22SRV-32](https://jira.uniks.de/browse/STP22SRV-32)

## Bugfixes

* Fixed an error when playing alone and getting the longest road.
* Fixed a number of issues with the longest road algorithm. [STP22SRV-31](https://jira.uniks.de/browse/STP22SRV-31)
* Fixed a problem in which the player with the longest road would get additional victory points when building more roads.

# v4.0.1

## Improvements

* Added the missing `PATCH /api/v4/maps/{mapId}/votes/{userId}` endpoint.

## Bugfixes

* Single road segments are now properly counted for the longest road. [STP22SRV-33](https://jira.uniks.de/browse/STP22SRV-33)
* The longest road is no longer updated to a smaller value when adding a road to a disconnected network. [STP22SRV-33](https://jira.uniks.de/browse/STP22SRV-33)

# v4.1.0

## New Features

+ Added the `MapTemplate` `description` property. [STP22SRV-35](https://jira.uniks.de/browse/STP22SRV-35)

## Improvements

* Specified a maximum length for the `Achievement` `id`.

## Documentation

* Documented the allowed values of the `Vote` `score` property.

## Bugfixes

* Updating a `Vote` `score` with `PATCH` now properly updates the `MapTemplate` `votes`. [STP22SRV-34](https://jira.uniks.de/browse/STP22SRV-34)
* Fixed a `500 Internal Server Error` when revealing the third knight card as the only player.
* Victory Points from the Largest Army are now properly added and deducted.
