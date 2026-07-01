import { useMemo, type CSSProperties, type ReactElement } from "react";
import { Chip, Typography } from "@mui/material";

import type { UserProductInquiryDetailStatusHistoryEntry } from "./inquiry-detail.api";
import type { UserProductInquiryStatus } from "./inquiries-list.api";
import {
  INQUIRY_STATUS_COLOR,
  INQUIRY_STATUS_LABEL,
} from "./inquiries-status.shared";
import DateTimeValue from "../../shared/display/DateTimeValue";
import { useTranslation } from "../../hooks/useTranslation";
import styles from "./styles/InquiryStatusHistoryTimeline.module.scss";

type InquiryStatusHistoryTimelineProps = {
  readonly entries: readonly UserProductInquiryDetailStatusHistoryEntry[];
  readonly emptyLabel: string;
};

const EMPTY_DISPLAY = "—";

const STATUS_CHIP_COLOR = INQUIRY_STATUS_COLOR;
const STATUS_CHIP_LABEL = INQUIRY_STATUS_LABEL;

const TIMELINE_ACCENT: Record<UserProductInquiryStatus, string> = {
  PREVIEW_GENERATED: "var(--mui-palette-info-main)",
  CALL_REQUESTED: "var(--mui-palette-warning-main)",
  PENDING: "var(--mui-palette-warning-main)",
  CONTACTED: "var(--mui-palette-primary-main)",
  SALE_COMPLETED: "var(--mui-palette-success-main)",
  CLOSED: "var(--mui-palette-text-secondary)",
  CANCELLED: "var(--mui-palette-error-main)",
};

function displayText(value: unknown): string {
  if (value == null) {
    return EMPTY_DISPLAY;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : EMPTY_DISPLAY;
}

function StatusChip({ status }: { readonly status: UserProductInquiryStatus }): ReactElement {
  return (
    <Chip
      size="small"
      variant="outlined"
      color={STATUS_CHIP_COLOR[status] ?? "default"}
      label={STATUS_CHIP_LABEL[status] ?? status}
    />
  );
}

function InquiryStatusHistoryTimeline({
  entries,
  emptyLabel,
}: InquiryStatusHistoryTimelineProps): ReactElement {
  const { t } = useTranslation();
  const orderedEntries = useMemo(
    () => [...entries].sort((left, right) => left.changedAt.localeCompare(right.changedAt)),
    [entries],
  );

  if (orderedEntries.length === 0) {
    return <p className={styles.emptyState}>{emptyLabel}</p>;
  }

  const latestIndex = orderedEntries.length - 1;

  return (
    <ol className={styles.timeline} aria-label={emptyLabel}>
      {orderedEntries.map((entry, index) => {
        const isLatest = index === latestIndex;
        const accent = TIMELINE_ACCENT[entry.status] ?? "var(--mui-palette-primary-main)";
        const itemStyle = { "--timeline-accent": accent } as CSSProperties;

        return (
          <li key={`${entry.changedAt}-${entry.status}-${index}`} className={styles.item} style={itemStyle}>
            <article className={[styles.card, isLatest ? styles.cardLatest : undefined].filter(Boolean).join(" ")}>
              <span className={styles.cardAccent} aria-hidden="true" />
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderStart}>
                  <StatusChip status={entry.status} />
                  <span className={[styles.dot, isLatest ? styles.dotLatest : undefined].filter(Boolean).join(" ")} />
                </div>
                <span className={styles.changedAt}>
                  <DateTimeValue value={entry.changedAt} emphasizeDate inlineDateTime />
                </span>
              </div>

              <div className={styles.descriptionBlock}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("pages.inquiries.viewModal.history.description")}
                </Typography>
                <Typography variant="body2" fontWeight={600} className={styles.description}>
                  {displayText(entry.description)}
                </Typography>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

export default InquiryStatusHistoryTimeline;
