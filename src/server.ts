import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';
import SchemaBuilder from '@pothos/core';
import { Keycloak } from 'keycloak-backend';
import { useKeycloak } from '@nexirift/plugin-keycloak';
import { redisClient } from './redis';
import { Context } from './context';

require('dotenv').config();

// Create a new instance of Keycloak
const keycloak = new Keycloak({
	realm: process.env.AUTH_REALM as string,
	keycloak_base_url: process.env.AUTH_BASE_URL as string,
	client_id: process.env.AUTH_CLIENT_ID as string
});

// Create a new instance of SchemaBuilder
const builder = new SchemaBuilder<{
	Context: Context;
}>({});

// Define the query type and its fields
builder.queryType({
	fields: (t) => ({
		hello: t.string({
			resolve: (_root, _args, ctx: Context) =>
				`Hello ${ctx?.keycloak?.preferred_username || 'Anonymous'}`
		})
	})
});

// Create a new instance of GraphQL Yoga with the schema and plugins
const yoga = createYoga({
	schema: builder.toSchema(),
	plugins: [
		useKeycloak({
			keycloak: keycloak,
			redis: redisClient
			// allowedRoles: ['galaxy-access'],
			// requireAuth: true,
			/* messages: {
				invalidToken: 'The provided access token is invalid.',
				expiredToken:
					'An invalid or expired access token was provided.',
				invalidPermissions:
					'You do not have the necessary permissions to access this resource.',
				authRequired:
					'Authentication is required to access this resource.'
			} */
		})
	]
});

// Create a new server using the GraphQL Yoga instance
const server = createServer(yoga);

// Start the server and listen on a port defined by .env
server.listen(process.env.PORT, async () => {
	await redisClient.connect();
	console.log('📊 GraphQL Yoga Keycloak Plugin Example');
	console.log(`🚀 Serving at http://localhost:${process.env.PORT}/graphql`);
});
