import { type ReactElement } from "react";

import SegmentFilterTabs from "../../shared/tabs/SegmentFilterTabs";
import type { ProductDetailSectionTab } from "./product-section-tabs.shared";

export type { ProductDetailSectionTab };

type ProductDetailSectionTabsProps = {
  readonly activeTab: ProductDetailSectionTab;
  readonly onChange: (tab: ProductDetailSectionTab) => void;
  readonly tabs: ReadonlyArray<{
    readonly value: ProductDetailSectionTab;
    readonly label: string;
  }>;
};

const ProductDetailSectionTabs = ({
  activeTab,
  onChange,
  tabs,
}: ProductDetailSectionTabsProps): ReactElement => {
  return (
    <SegmentFilterTabs
      activeTab={activeTab}
      tabs={tabs}
      onChange={(tab, _event) => onChange(tab)}
      ariaLabel="بخش‌های صفحه محصول"
      pinned
      pinnedAnchorId="product-detail-tabs"
      disableScrollToTopOnChange
    />
  );
};

export default ProductDetailSectionTabs;
