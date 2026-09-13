import { describe, expect, it } from 'vitest';
import { parse, safeParse } from 'valibot';
import { authInputSchema, localeSchema, profileInputSchema, taskInputSchema } from './index';

describe('input boundaries', () => {
  it('normalizes task titles and strips fields that clients must not control', () => {
    expect(
      parse(taskInputSchema, { title: '  A task \n', user_id: 'other', completed: true }),
    ).toEqual({ title: 'A task' });
  });
  it('rejects blank and oversized titles while accepting the exact limit', () => {
    for (const title of ['', ' \n\t', 'a'.repeat(161)])
      expect(safeParse(taskInputSchema, { title }).success).toBe(false);
    expect(safeParse(taskInputSchema, { title: 'a'.repeat(160) }).success).toBe(true);
  });
  it('validates names after trimming', () => {
    expect(parse(profileInputSchema, { display_name: '  Alice  ' })).toEqual({
      display_name: 'Alice',
    });
    expect(safeParse(profileInputSchema, { display_name: ' ' }).success).toBe(false);
    expect(safeParse(profileInputSchema, { display_name: 'a'.repeat(81) }).success).toBe(false);
  });
  it('trims email without changing a password containing spaces', () => {
    expect(parse(authInputSchema, { email: ' user@example.com ', password: '  secret  ' })).toEqual(
      { email: 'user@example.com', password: '  secret  ' },
    );
    expect(safeParse(authInputSchema, { email: 'invalid', password: '12345678' }).success).toBe(
      false,
    );
    expect(safeParse(authInputSchema, { email: 'u@example.com', password: 'short' }).success).toBe(
      false,
    );
  });
  it('accepts only supported locales', () => {
    expect(parse(localeSchema, 'fr')).toBe('fr');
    expect(safeParse(localeSchema, 'de').success).toBe(false);
  });
});
