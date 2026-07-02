import { useCallback, useMemo, type MouseEvent, type ReactElement } from "react";

import SegmentFilterTabs from "../../shared/tabs/SegmentFilterTabs";
import { PRODUCT_FORM_SECTION_TABS, type ProductSectionTab } from "./product-section-tabs.shared";
import formSectionStyles from "./product-form-dialog/styles/ProductFormSections.module.scss";

type ProductFormSectionTabsProps = {
  readonly activeTab: ProductSectionTab;
  readonly onChange: (tab: ProductSectionTab) => void;
  readonly pendingModerationCount?: number;
};

const ProductFormSectionTabs = ({
  activeTab,
  onChange,
  pendingModerationCount = 0,
}: ProductFormSectionTabsProps): ReactElement => {
  const handleTabChange = useCallback(
    (tab: ProductSectionTab, _event: MouseEvent<HTMLButtonElement>): void => {
      onChange(tab);
    },
    [onChange]
  );

  const tabs = useMemo(
    () =>
      PRODUCT_FORM_SECTION_TABS.map(({ value, label }) => {
        if (value !== "reviews" || pendingModerationCount <= 0) {
          return { value, label };
        }

        return {
          value,
          label: (
            <span className={formSectionStyles.sectionTabLabelWithBadge}>
              <span>{label}</span>
              <span className={formSectionStyles.sectionTabBadge}>
                {pendingModerationCount.toLocaleString("fa-IR")}
              </span>
            </span>
          ),
        };
      }),
    [pendingModerationCount]
  );

  return (
    <SegmentFilterTabs
      activeTab={activeTab}
      tabs={tabs}
      onChange={handleTabChange}
      ariaLabel="بخش‌های ویرایش محصول"
      pinned
      pinnedSurface="dialog"
      pinnedAnchorId="product-form-tabs"
      disableScrollToTopOnChange
    />
  );
};

export default ProductFormSectionTabs;
