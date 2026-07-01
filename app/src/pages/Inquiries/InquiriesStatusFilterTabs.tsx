import { type ReactElement } from "react";

import SegmentFilterTabs from "../../shared/tabs/SegmentFilterTabs";
import { useTranslation } from "../../hooks/useTranslation";
import {
  INQUIRY_STATUS_TAB_ORDER,
  type UserProductInquiryStatusFilterTab,
} from "./inquiries-list.api";

type InquiriesStatusFilterTabsProps = {
  readonly activeTab: UserProductInquiryStatusFilterTab;
  readonly onChange: (tab: UserProductInquiryStatusFilterTab) => void;
};

const INQUIRY_STATUS_TABS_COLUMNS_PER_ROW = 4;

const InquiriesStatusFilterTabs = ({
  activeTab,
  onChange,
}: InquiriesStatusFilterTabsProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <SegmentFilterTabs
      activeTab={activeTab}
      columnsPerRow={INQUIRY_STATUS_TABS_COLUMNS_PER_ROW}
      tabs={INQUIRY_STATUS_TAB_ORDER.map((tab) => ({
        value: tab,
        label: t(`pages.inquiries.statusFilters.${tab}`),
      }))}
      onChange={onChange}
      ariaLabel={t("pages.inquiries.statusFilters.ariaLabel")}
    />
  );
};

export default InquiriesStatusFilterTabs;
