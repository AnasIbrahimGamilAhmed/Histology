export const DEFAULT_USER_ID = "demo-user";

export function getSafeUserId(value: string | undefined): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : DEFAULT_USER_ID;
}
