import type { ReactElement } from "react";
import styles from "./styles/ProductCard.module.scss";

const ProductCardWarrantyRibbon = (): ReactElement => (
  <div className={styles.warrantyRibbon} aria-hidden="true">
    <span className={styles.warrantyRibbonText}>گارانتی ۲۴ ماهه</span>
  </div>
);

export default ProductCardWarrantyRibbon;
