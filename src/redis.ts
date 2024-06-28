// Import the createClient function from the 'redis' module
import { createClient } from 'redis';

// Create a Redis client using the createClient function
export const redisClient = createClient({
	url: process.env.REDIS_URL as string
});

// Listen for any errors that occur in the Redis client
redisClient.on('error', (err) => console.log('Redis Client Error', err));
