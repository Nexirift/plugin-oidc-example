# plugin-keycloak-example

An example [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga) project to get you started with [plugin-keycloak](https://github.com/Nexirift/plugin-keycloak).

## Installation

### Prerequisites

- [Redis](https://redis.io)
- [Keycloak](https://www.keycloak.org)

### Instructions

0. Set up the prerequistes first
   - See [Setting up Keycloak](#setting-up-keycloak)
1. Clone the project by using Git: `git clone https://github.com/Nexirift/plugin-keycloak-example`
2. Install packages using yarn: `yarn install`
3. Start the server using: `yarn dev`
4. Configure the `.env` values
5. Send a test request below

### Sending a request

```bash
curl --request POST \
--url http://localhost:3000/graphql \
--header 'Authorization: Bearer ' \
--header 'Content-Type: application/json' \
--data '{"query":"query hello {\n\thello\n}","operationName":"hello"}'
```

_Pass access token after the Bearer_

## Setting up Keycloak

1. Visit your Keycloak administration panel.
2. Clients > Create client:
   - Client ID: `plugin-keycloak-test`
   - Valid redirect URIs: `/*`
   - Web origins: `/*`
3. Use the following template (replace auth.local):
   ```
   http://auth.local/realms/master/protocol/openid-connect/auth?response_type=code&client_id=plugin-keycloak-test&redirect_uri=https://auth.local&scope=openid
   ```
4. It'll respond with something like this:
   ```
   http://auth.local/?session_state=19e5228b...&code=3a542842.../
   ```
5. You need to copy the value after `&code=` (without `/`)
6. Use the following template (replace auth.local and code):
   ```bash
   curl --request POST \
   --url 'http://auth.local/realms/master/protocol/openid-connect/token?=' \
   --header 'Content-Type: application/x-www-form-urlencoded' \
   --data grant_type=authorization_code \
   --data redirect_uri=http://auth.local \
   --data client_id=plugin-keycloak-test \
   --data code=3a542842...
   ```
7. It should respond with something like:
   ```json
   {
     "access_token": "eyJhbG...",
     "expires_in": 60,
     "refresh_expires_in": 86372,
     "refresh_token": "eyJhbG...",
     "token_type": "Bearer",
     "id_token": "eyJhbG...",
     "not-before-policy": 0,
     "session_state": "19e5228b...",
     "scope": "openid profile email"
   }
   ```

If you ever need to refresh the token, copy the refresh_token and follow the template:

```bash
curl --request POST \
--url 'http://auth.local/realms/master/protocol/openid-connect/token?=' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data grant_type=refresh_token \
--data client_id=plugin-keycloak-test \
--data refresh_token=eyJhbG...
```

The access_token returned by either one of these requests will be used in the [Sending a request](#sending-a-request) section under after `Bearer`.
