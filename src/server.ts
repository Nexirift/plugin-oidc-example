import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';
import SchemaBuilder from '@pothos/core';
import { Keycloak } from 'keycloak-backend';
import { useKeycloak } from '@nexirift/plugin-keycloak';
import { redisClient } from './redis';
import { Context } from "./context";

// Create a new instance of Keycloak
const keycloak = new Keycloak({
  "realm": "master",
  "keycloak_base_url": "http://auth.local",
  "client_id": "plugin-keycloak-test"
})

// Create a new instance of SchemaBuilder
const builder = new SchemaBuilder<{
  Context: Context,
}>({});

// Define the query type and its fields
builder.queryType({
  fields: (t) => ({
    hello: t.string({
      resolve: (_root, _args, ctx: Context) => `Hello ${ctx?.keycloak?.preferred_username || "Anonymous"}`,
    }),
  }),
});

// Create a new instance of GraphQL Yoga with the schema and plugins
const yoga = createYoga({
  schema: builder.toSchema(),
  plugins: [
    useKeycloak({
      keycloak: keycloak,
      redis: redisClient
    })
  ],
});

// Create a new server using the GraphQL Yoga instance
const server = createServer(yoga);

// Start the server and listen on port 3000
server.listen(3000, async () => {
  await redisClient.connect();
  console.log("📊 GraphQL Yoga Keycloak Plugin Example")
  console.log('🚀 Serving at http://localhost:3000/graphql');
});
