/** SERVER/TOOLING ONLY. Frontends import @agency/supabase, never this package. */
import { sql } from 'drizzle-orm';
import { boolean, check, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(),
    display_name: text('display_name').default('New user').notNull(),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      'profiles_display_name_valid',
      sql`char_length(btrim(${table.display_name})) between 1 and 80 and ${table.display_name} = btrim(${table.display_name})`,
    ),
  ],
).enableRLS();

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    completed: boolean('completed').default(false).notNull(),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('tasks_user_created_idx').on(table.user_id, table.created_at, table.id),
    check(
      'tasks_title_valid',
      sql`char_length(btrim(${table.title})) between 1 and 160 and ${table.title} = btrim(${table.title})`,
    ),
  ],
).enableRLS();
