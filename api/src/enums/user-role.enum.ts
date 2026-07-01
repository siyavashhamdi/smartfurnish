export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN", // Super Admin - Platform-level admin for global app settings (billing, config, system)
  END_USER = "END_USER", // ثبت‌نام‌شده - Registered user
  ANONYMOUS = "ANONYMOUS", // میهمان - Anonymous visitor with a server-issued session only
}
