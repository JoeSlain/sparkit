import * as v from 'valibot';

export const taskInputSchema = v.object({
  title: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Enter a task title.'),
    v.maxLength(160, 'Use at most 160 characters.'),
  ),
});
export const profileInputSchema = v.object({
  display_name: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Enter your name.'),
    v.maxLength(80, 'Use at most 80 characters.'),
  ),
});
export const authInputSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email('Enter a valid email address.')),
  password: v.pipe(v.string(), v.minLength(8, 'Use at least 8 characters.')),
});
export const localeSchema = v.picklist(['en', 'fr']);
export type TaskInput = v.InferInput<typeof taskInputSchema>;
export type ProfileInput = v.InferInput<typeof profileInputSchema>;
export type AuthInput = v.InferInput<typeof authInputSchema>;
export type Locale = v.InferOutput<typeof localeSchema>;
