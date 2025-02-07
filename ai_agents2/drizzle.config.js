import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './db/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
/*Drizzle config - a configuration file that is used by Drizzle Kit and contains all the information about your database connection, migration folder and schema files. */