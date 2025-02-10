/*ORM -Object Realtional Mapping - connects OOPS language to relational DB to perform crud ops*/
/*connecting Drizzle ORM to DB */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle(process.env.DATABASE_URL);
// console.log("db from db/index.js: ", db);