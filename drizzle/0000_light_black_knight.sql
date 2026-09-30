CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`correct` integer NOT NULL,
	`assisted` integer NOT NULL,
	`fields` text NOT NULL,
	`created_at` text NOT NULL,
	`local_day` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `practice_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_attempts_user_day` ON `attempts` (`user_id`,`local_day`);--> statement-breakpoint
CREATE INDEX `idx_attempts_user_exercise` ON `attempts` (`user_id`,`exercise_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_attempt_correct_session` ON `attempts` (`session_id`,`id`);--> statement-breakpoint
CREATE TABLE `practice_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`assisted` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`closed_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_user` ON `practice_sessions` (`user_id`);