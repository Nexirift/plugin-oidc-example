import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';
import SchemaBuilder from '@pothos/core';
import { redisClient } from './redis';
import { Context } from './context';
import { OIDC, OIDCToken, useOIDC } from '@nexirift/plugin-oidc';

require('dotenv').config();

// Create a new instance of OIDC
const oidc = new OIDC({
	introspect_url: process.env.AUTH_INTROSPECT_URL as string,
	client_id: process.env.AUTH_CLIENT_ID as string,
	client_secret: process.env.AUTH_CLIENT_SECRET as string
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
				`Hello ${ctx?.oidc?.preferred_username || 'Anonymous'}`
		}),
		checkScope: t.boolean({
			resolve: (_root, _args, ctx: Context) => {
				if (!ctx.oidc) {
					return false;
				}

				return new OIDCToken(ctx.oidc).hasScopes(['test:scope']);
			}
		})
	})
});

// Create a new instance of GraphQL Yoga with the schema and plugins
const yoga = createYoga({
	schema: builder.toSchema(),
	plugins: [
		useOIDC({
			oidc: oidc,
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
	console.log('📊 GraphQL Yoga OIDC Plugin Example');
	console.log(`🚀 Serving at http://localhost:${process.env.PORT}/graphql`);
});
