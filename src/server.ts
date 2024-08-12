import { OIDC, OIDCToken, useOIDC } from '@nexirift/plugin-oidc';
import SchemaBuilder from '@pothos/core';
import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';
import { Context } from './context';
import { redisClient } from './redis';

require('dotenv').config();

// Create a new instance of OIDC
const oidc = new OIDC({
	introspect_url: process.env.AUTH_INTROSPECT_URL as string,
	client_id: process.env.AUTH_CLIENT_ID as string,
	client_secret: process.env.AUTH_CLIENT_SECRET as string
});

// Create a new instance of SchemaBuilder
const builder = new SchemaBuilder<{
	Defaults: 'v3';
	Context: Context;
}>({
	defaults: 'v3'
});

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

export async function startServer() {
	const server = Bun.serve({
		async fetch(req) {
			return yoga.fetch(req);
		}
	});

	await redisClient.connect();
	console.log('📊 GraphQL Yoga OIDC Plugin Example');
	console.log(
		`🚀 Serving at ${new URL(
			yoga.graphqlEndpoint,
			`http://${server.hostname}:${server.port}`
		)}`
	);
}

if (process.env.NODE_ENV !== 'test') {
	startServer();
}
