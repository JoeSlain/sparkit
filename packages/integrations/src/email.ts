import * as v from 'valibot';
import { Resend } from 'resend';
import { trimPublicConfig } from './config';

const emailInputSchema = v.object({
  to: v.pipe(v.string(), v.email()),
  subject: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  html: v.pipe(v.string(), v.minLength(1)),
  from: v.optional(v.pipe(v.string(), v.email())),
});

export type TransactionalEmailInput = v.InferInput<typeof emailInputSchema>;

/** Server/CI only. Never import from web or mobile bundles. */
export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
  options?: { apiKey?: string; defaultFrom?: string },
): Promise<{ id: string }> {
  const apiKey = trimPublicConfig(options?.apiKey ?? process.env.RESEND_API_KEY);
  if (!apiKey) {
    throw new Error('Resend is disabled: set RESEND_API_KEY on the server.');
  }
  const payload = v.parse(emailInputSchema, input);
  const from =
    payload.from ??
    trimPublicConfig(options?.defaultFrom ?? process.env.RESEND_FROM) ??
    'Sparkit <onboarding@resend.dev>';
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });
  if (result.error) throw new Error(result.error.message);
  if (!result.data?.id) throw new Error('Resend did not return a message id.');
  return { id: result.data.id };
}

export function isResendConfigured(apiKey = process.env.RESEND_API_KEY): boolean {
  return Boolean(trimPublicConfig(apiKey));
}
