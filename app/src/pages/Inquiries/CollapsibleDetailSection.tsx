import { useState, type ReactElement, type ReactNode } from "react";
import { Collapse, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

import styles from "./styles/InquiryViewModal.module.scss";

type CollapsibleDetailSectionProps = {
  readonly title: ReactNode;
  readonly children: ReactNode;
  readonly defaultExpanded?: boolean;
  readonly variant?: "default" | "highlight";
};

function CollapsibleDetailSection({
  title,
  children,
  defaultExpanded = false,
  variant = "default",
}: CollapsibleDetailSectionProps): ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const sectionClassName = [
    styles.sectionCollapsible,
    variant === "highlight" ? styles.sectionCollapsibleHighlighted : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClassName}>
      <button
        type="button"
        className={styles.sectionToggle}
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        {typeof title === "string" ? (
          <Typography variant="subtitle1" fontWeight={800} component="span">
            {title}
          </Typography>
        ) : (
          <span className={styles.sectionToggleTitle}>{title}</span>
        )}
        <ExpandMoreRoundedIcon
          className={[
            styles.sectionToggleIcon,
            expanded ? styles.sectionToggleIconExpanded : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
          fontSize="small"
        />
      </button>
      <Collapse in={expanded}>
        <div className={styles.sectionBody}>{children}</div>
      </Collapse>
    </section>
  );
}

export default CollapsibleDetailSection;
