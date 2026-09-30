import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const practiceSessions = sqliteTable('practice_sessions', {
 id:text('id').primaryKey(), userId:text('user_id').notNull(), exerciseId:text('exercise_id').notNull(),
 assisted:integer('assisted').notNull().default(0), createdAt:text('created_at').notNull(), closedAt:text('closed_at')
},t=>[index('idx_sessions_user').on(t.userId)]);
export const attempts = sqliteTable('attempts', {
 id:text('id').primaryKey(), userId:text('user_id').notNull(), sessionId:text('session_id').notNull().references(()=>practiceSessions.id), exerciseId:text('exercise_id').notNull(),
 correct:integer('correct').notNull(), assisted:integer('assisted').notNull(), fields:text('fields').notNull(), createdAt:text('created_at').notNull(), localDay:text('local_day').notNull()
},t=>[index('idx_attempts_user_day').on(t.userId,t.localDay),index('idx_attempts_user_exercise').on(t.userId,t.exerciseId),uniqueIndex('idx_attempt_correct_session').on(t.sessionId,t.id)]);
