import type { User } from "@prisma/client";

/** Prisma User を API レスポンス用 UserProfile に変換 */
export function toUserProfile(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    firstNameKana: user.firstNameKana,
    lastNameKana: user.lastNameKana,
    birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : null,
    gender: user.gender,
    phone: user.phone,
    postalCode: user.postalCode,
    prefecture: user.prefecture,
    cityTown: user.cityTown,
    addressLine: user.addressLine,
    avatarUrl: user.image,
    notificationsEnabled: user.notificationsEnabled,
    createdAt: user.createdAt.toISOString(),
  };
}
