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

# v2.0.0 - Base Settlers Game

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
