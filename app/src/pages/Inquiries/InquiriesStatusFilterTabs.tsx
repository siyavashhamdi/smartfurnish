import { useMemo, type MouseEvent, type ReactElement } from "react";

import SegmentFilterTabs from "../../shared/tabs/SegmentFilterTabs";
import { useTranslation } from "../../hooks/useTranslation";
import {
  INQUIRY_STATUS_TAB_ORDER,
  resolveInquiryStatusTabSelection,
  type UserProductInquiryStatus,
  type UserProductInquiryStatusFilterTab,
} from "./inquiries-list.api";

type InquiriesStatusFilterTabsProps = {
  readonly activeStatusTabs: readonly UserProductInquiryStatus[];
  readonly onChange: (tabs: UserProductInquiryStatus[]) => void;
};

const INQUIRY_STATUS_TABS_COLUMNS_PER_ROW = 4;

const InquiriesStatusFilterTabs = ({
  activeStatusTabs,
  onChange,
}: InquiriesStatusFilterTabsProps): ReactElement => {
  const { t } = useTranslation();

  const activeTabs = useMemo((): readonly UserProductInquiryStatusFilterTab[] => {
    if (activeStatusTabs.length === 0) {
      return ["ALL"];
    }

    return activeStatusTabs;
  }, [activeStatusTabs]);

  const handleTabChange = (
    tab: UserProductInquiryStatusFilterTab,
    event: MouseEvent<HTMLButtonElement>,
    options?: { readonly additiveSelect?: boolean },
  ): void => {
    const additiveSelect = event.shiftKey || options?.additiveSelect === true;
    onChange(resolveInquiryStatusTabSelection(activeStatusTabs, tab, additiveSelect));
  };

  return (
    <SegmentFilterTabs
      activeTabs={activeTabs}
      columnsPerRow={INQUIRY_STATUS_TABS_COLUMNS_PER_ROW}
      longPressMultiSelect
      tabs={INQUIRY_STATUS_TAB_ORDER.map((tab) => ({
        value: tab,
        label: t(`pages.inquiries.statusFilters.${tab}`),
      }))}
      onChange={handleTabChange}
      ariaLabel={t("pages.inquiries.statusFilters.ariaLabel")}
    />
  );
};

export default InquiriesStatusFilterTabs;
