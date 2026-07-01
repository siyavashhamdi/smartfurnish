import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import ContactPhoneRoundedIcon from "@mui/icons-material/ContactPhoneRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import type { ComponentType } from "react";
import { PAYMENTS_ENABLED } from "../constants/payments.constants";
import { UserRole } from "../lib/graphql/generated";
import { APP_SHELL_ROUTES } from "../routing/app-shell-routes";

export type AppShellNavIcon = ComponentType<{ className?: string }>;

export type AppShellNavBadgeKind =
  | "products"
  | "payments"
  | "notifications"
  | "support"
  | "inquiries";

export type AppShellNavItemId =
  | "ourStory"
  | "products"
  | "payments"
  | "inquiries"
  | "notifications"
  | "support"
  | "profile"
  | "more";

export type AppShellNavItemDefinition = {
  readonly id: AppShellNavItemId;
  readonly title: string;
  readonly path: string;
  readonly Icon: AppShellNavIcon;
  readonly requiredRoles?: readonly UserRole[];
  readonly excludeRoles?: readonly UserRole[];
  readonly requiresAuth?: boolean;
  readonly badge?: AppShellNavBadgeKind;
  readonly supportTicketsForSuperAdmin?: boolean;
  /** Match only the exact nav path, not nested routes (e.g. /products/:id). */
  readonly exactPathMatch?: boolean;
};

export const APP_SHELL_NAV_ITEMS: readonly AppShellNavItemDefinition[] = [
  {
    id: "ourStory",
    title: "داستان ما",
    path: APP_SHELL_ROUTES.landing,
    Icon: AutoStoriesRoundedIcon,
    exactPathMatch: true,
    excludeRoles: [UserRole.SUPER_ADMIN],
  },
  {
    id: "products",
    title: "شو روم",
    path: APP_SHELL_ROUTES.products,
    Icon: MenuBookRoundedIcon,
    badge: "products",
    exactPathMatch: true,
  },
  {
    id: "payments",
    title: "پرداخت‌ها",
    path: APP_SHELL_ROUTES.payments,
    Icon: AccountBalanceWalletRoundedIcon,
    requiredRoles: [UserRole.SUPER_ADMIN],
    badge: "payments",
  },
  {
    id: "inquiries",
    title: "استعلام‌ها",
    path: APP_SHELL_ROUTES.inquiries,
    Icon: ContactPhoneRoundedIcon,
    requiredRoles: [UserRole.SUPER_ADMIN],
    badge: "inquiries",
  },
  {
    id: "notifications",
    title: "اعلان‌ها",
    path: APP_SHELL_ROUTES.notifications,
    Icon: NotificationsNoneRoundedIcon,
    requiresAuth: true,
    badge: "notifications",
  },
  {
    id: "support",
    title: "پشتیبانی",
    path: APP_SHELL_ROUTES.support,
    Icon: ConfirmationNumberRoundedIcon,
    supportTicketsForSuperAdmin: true,
    badge: "support",
  },
  {
    id: "profile",
    title: "پروفایل",
    path: APP_SHELL_ROUTES.profile,
    Icon: PersonRoundedIcon,
  },
  {
    id: "more",
    title: "سایر",
    path: APP_SHELL_ROUTES.more,
    Icon: MoreHorizRoundedIcon,
  },
];

export type AppShellNavContext = {
  readonly roles: readonly string[];
  readonly isAuthenticated: boolean;
};

export type AppShellNavBadgeCounts = {
  readonly products: number;
  readonly payments: number;
  readonly notifications: number;
  readonly support: number;
  readonly inquiries: number;
};

export function filterAppShellNavItems(
  items: readonly AppShellNavItemDefinition[],
  context: AppShellNavContext
): readonly AppShellNavItemDefinition[] {
  return items.filter((item) => {
    if (item.id === "payments" && !PAYMENTS_ENABLED) {
      return false;
    }

    if (item.excludeRoles?.some((role) => context.roles.includes(role))) {
      return false;
    }

    if (item.requiresAuth && !context.isAuthenticated) {
      return false;
    }

    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true;
    }

    return item.requiredRoles.some((role) => context.roles.includes(role));
  });
}

export function resolveAppShellNavPath(
  item: AppShellNavItemDefinition,
  context: AppShellNavContext
): string {
  if (item.supportTicketsForSuperAdmin && context.roles.includes(UserRole.SUPER_ADMIN)) {
    return APP_SHELL_ROUTES.supportTickets;
  }

  return item.path;
}

export function resolveAppShellNavBadgeCount(
  item: AppShellNavItemDefinition,
  counts: AppShellNavBadgeCounts
): number {
  if (!item.badge) {
    return 0;
  }

  return counts[item.badge] ?? 0;
}
