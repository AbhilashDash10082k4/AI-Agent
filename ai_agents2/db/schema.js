import { integer, timestamp, pgTable, varchar, text } from "drizzle-orm/pg-core";

export const todosTable = pgTable('todos', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at').defaultNow(),
  todo: text().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date())
});
// console.log("todosTable: ", todosTable);