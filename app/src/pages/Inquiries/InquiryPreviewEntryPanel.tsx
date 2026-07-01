import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Collapse, Stack, Typography } from "@mui/material";
import { useState, type ReactElement, type ReactNode } from "react";

import styles from "./styles/InquiryViewModal.module.scss";

type InquiryPreviewEntryPanelProps = {
  readonly title: string;
  readonly summary?: ReactNode;
  readonly children: ReactNode;
};

function InquiryPreviewEntryPanel({
  title,
  summary,
  children,
}: InquiryPreviewEntryPanelProps): ReactElement {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className={styles.previewEntryBox}>
      <button
        type="button"
        className={styles.previewEntryToggle}
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <Stack spacing={0.25} className={styles.previewEntryToggleCopy}>
          <Typography variant="subtitle2" fontWeight={800} component="span">
            {title}
          </Typography>
          {summary ? (
            <Typography variant="caption" color="text.secondary" component="span">
              {summary}
            </Typography>
          ) : null}
        </Stack>
        <ExpandMoreRoundedIcon
          className={[styles.sectionToggleIcon, expanded ? styles.sectionToggleIconExpanded : undefined]
            .filter(Boolean)
            .join(" ")}
          fontSize="small"
        />
      </button>
      <Collapse in={expanded} unmountOnExit>
        <div className={styles.previewEntryBody}>{children}</div>
      </Collapse>
    </section>
  );
}

export default InquiryPreviewEntryPanel;
