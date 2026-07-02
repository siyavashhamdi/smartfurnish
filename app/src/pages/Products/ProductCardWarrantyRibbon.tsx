import type { ReactElement } from "react";
import styles from "./styles/ProductCard.module.scss";

type ProductCardWarrantyRibbonProps = {
  readonly months: number;
};

const ProductCardWarrantyRibbon = ({
  months,
}: ProductCardWarrantyRibbonProps): ReactElement => (
  <div className={styles.warrantyRibbon} aria-hidden="true">
    <span className={styles.warrantyRibbonText}>
      گارانتی {months.toLocaleString("fa-IR")} ماهه
    </span>
  </div>
);

export default ProductCardWarrantyRibbon;
