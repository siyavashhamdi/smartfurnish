import { useMemo, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { useQuery } from "@apollo/client/react";
import { Box, Chip, Typography } from "@mui/material";

import type { UserProductInquiryDetailStatusHistoryEntry } from "./inquiry-detail.api";
import type { UserProductInquiryStatus } from "./inquiries-list.api";
import {
  INQUIRY_STATUS_COLOR,
  INQUIRY_STATUS_LABEL,
} from "./inquiries-status.shared";
import { USER_DETAIL_QUERY } from "../../graphql/queries/userDetail.query";
import DateTimeValue from "../../shared/display/DateTimeValue";
import { useTranslation } from "../../hooks/useTranslation";
import { formatProductPrice } from "../Products/product-detail.api";
import type {
  UserDetailQuery,
  UserDetailQueryVariables,
} from "../UsersManagement/users-management-list.api";
import styles from "./styles/InquiryStatusHistoryTimeline.module.scss";

type InquiryStatusHistoryTimelineProps = {
  readonly entries: readonly UserProductInquiryDetailStatusHistoryEntry[];
  readonly emptyLabel: string;
};

type PayloadField = {
  readonly label: string;
  readonly value: ReactNode;
  readonly latin?: boolean;
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

function formatUserDetailDisplayName(user: UserDetailQuery["userDetail"]): string {
  const parts = [user.profile?.firstName?.trim(), user.profile?.lastName?.trim()].filter(
    (part): part is string => Boolean(part),
  );

  return parts.length > 0 ? parts.join(" ") : user.username;
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

function PayloadFieldValue({
  value,
  latin,
}: {
  readonly value: ReactNode;
  readonly latin?: boolean;
}): ReactElement {
  if (typeof value === "string" || typeof value === "number") {
    return (
      <Typography
        variant="body2"
        fontWeight={600}
        className={latin ? styles.latinValue : undefined}
        sx={{ overflowWrap: "anywhere" }}
      >
        {String(value)}
      </Typography>
    );
  }

  return <Box sx={{ overflowWrap: "anywhere" }}>{value}</Box>;
}

function PayloadFieldGrid({ fields }: { readonly fields: readonly PayloadField[] }): ReactElement {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.25,
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      }}
    >
      {fields.map((field) => (
        <Box key={field.label}>
          <Typography variant="caption" color="text.secondary" display="block">
            {field.label}
          </Typography>
          <Box sx={{ mt: 0.25 }}>
            <PayloadFieldValue value={field.value} latin={field.latin} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function UserReferenceValue({ userId }: { readonly userId: string }): ReactElement {
  const { data, loading } = useQuery<UserDetailQuery, UserDetailQueryVariables>(
    USER_DETAIL_QUERY,
    {
      variables: { input: { id: userId } },
      skip: !userId.trim(),
      fetchPolicy: "cache-first",
    },
  );

  if (loading && !data?.userDetail) {
    return (
      <Typography variant="body2" fontWeight={600} color="text.secondary">
        {EMPTY_DISPLAY}
      </Typography>
    );
  }

  if (!data?.userDetail) {
    return (
      <Typography variant="body2" fontWeight={600} className={styles.latinValue} sx={{ overflowWrap: "anywhere" }}>
        {displayText(userId)}
      </Typography>
    );
  }

  return (
    <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: "anywhere" }}>
      {formatUserDetailDisplayName(data.userDetail)}
    </Typography>
  );
}

function StatusHistoryDetailsSection({
  entry,
}: {
  readonly entry: UserProductInquiryDetailStatusHistoryEntry;
}): ReactElement | null {
  const { t } = useTranslation();

  if (entry.status === "CONTACTED" && entry.contacted) {
    const fields: PayloadField[] = [];

    if (entry.contacted.contactedAt?.trim()) {
      fields.push({
        label: t("pages.inquiries.viewModal.history.contactedAt"),
        value: <DateTimeValue value={entry.contacted.contactedAt} emphasizeDate inlineDateTime />,
      });
    }

    if (entry.contacted.contactedBy?.trim()) {
      fields.push({
        label: t("pages.inquiries.viewModal.history.contactedBy"),
        value: <UserReferenceValue userId={entry.contacted.contactedBy} />,
      });
    }

    if (fields.length === 0) {
      return null;
    }

    return (
      <div className={styles.payloadBlock}>
        <PayloadFieldGrid fields={fields} />
      </div>
    );
  }

  if (entry.status === "SALE_COMPLETED" && entry.saleCompleted) {
    const fields: PayloadField[] = [];

    if (entry.saleCompleted.completedAt?.trim()) {
      fields.push({
        label: t("pages.inquiries.viewModal.history.completedAt"),
        value: (
          <DateTimeValue value={entry.saleCompleted.completedAt} emphasizeDate inlineDateTime />
        ),
      });
    }

    if (entry.saleCompleted.completedBy?.trim()) {
      fields.push({
        label: t("pages.inquiries.viewModal.history.completedBy"),
        value: <UserReferenceValue userId={entry.saleCompleted.completedBy} />,
      });
    }

    if (entry.saleCompleted.finalPriceIrt != null) {
      fields.push({
        label: t("pages.inquiries.viewModal.history.finalPriceIrt"),
        value: formatProductPrice(entry.saleCompleted.finalPriceIrt),
      });
    }

    if (fields.length === 0) {
      return null;
    }

    return (
      <div className={styles.payloadBlock}>
        <PayloadFieldGrid fields={fields} />
      </div>
    );
  }

  return null;
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
          <li
            key={`${entry.changedAt}-${entry.status}-${index}`}
            className={styles.item}
            style={itemStyle}
          >
            <article
              className={[styles.card, isLatest ? styles.cardLatest : undefined]
                .filter(Boolean)
                .join(" ")}
            >
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

              <StatusHistoryDetailsSection entry={entry} />
            </article>
          </li>
        );
      })}
    </ol>
  );
}

export default InquiryStatusHistoryTimeline;
