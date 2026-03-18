export function buildContactFullName(lastName?: string | null, firstName?: string | null) {
  return [lastName?.trim(), firstName?.trim()].filter(Boolean).join(" ").trim();
}

export function getDisplayLastName(user: {
  lastName?: string | null;
  name?: string | null;
}) {
  if (user.lastName?.trim()) return user.lastName.trim();
  return user.name?.trim().split(/\s+/).filter(Boolean)[0] || "";
}

export function getDisplayFirstName(user: {
  firstName?: string | null;
  name?: string | null;
}) {
  if (user.firstName?.trim()) return user.firstName.trim();
  const parts = user.name?.trim().split(/\s+/).filter(Boolean) || [];
  return parts.slice(1).join(" ");
}
