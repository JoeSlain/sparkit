export function trimPublicConfig(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function isIntegrationConfigured(...values: Array<string | undefined | null>): boolean {
  return values.every((value) => Boolean(trimPublicConfig(value)));
}
