import { type ReactElement } from "react";

import SegmentFilterTabs from "../../shared/tabs/SegmentFilterTabs";
import { useTranslation } from "../../hooks/useTranslation";
import type { UsersManagementRoleFilterTab } from "./users-management.types";

type UsersManagementFilterTabsProps = {
  readonly activeTab: UsersManagementRoleFilterTab;
  readonly onChange: (tab: UsersManagementRoleFilterTab) => void;
};

const TAB_ORDER: UsersManagementRoleFilterTab[] = [
  "END_USER",
  "SUPER_ADMIN",
  "ANONYMOUS",
  "ALL",
];

const UsersManagementFilterTabs = ({
  activeTab,
  onChange,
}: UsersManagementFilterTabsProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <SegmentFilterTabs
      activeTab={activeTab}
      tabs={TAB_ORDER.map((tab) => ({
        value: tab,
        label: t(`pages.usersManagement.roleFilters.${tab}`),
      }))}
      onChange={onChange}
      ariaLabel={t("pages.usersManagement.roleFilters.ariaLabel")}
    />
  );
};

export default UsersManagementFilterTabs;
