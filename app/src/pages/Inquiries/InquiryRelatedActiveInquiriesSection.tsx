import { type ReactElement } from "react";
import {
  Alert,
  Chip,
  List,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";

import type { UserProductInquiryDetailRelatedActiveInquiry } from "./inquiry-detail.api";
import type { UserProductInquiryStatus } from "./inquiries-list.api";
import {
  INQUIRY_STATUS_COLOR,
  INQUIRY_STATUS_LABEL,
} from "./inquiries-status.shared";
import { useTranslation } from "../../hooks/useTranslation";
import DateTimeValue from "../../shared/display/DateTimeValue";
import { toWesternDigits } from "../../utilities/persian-digits.util";
import styles from "./styles/InquiryRelatedActiveInquiriesSection.module.scss";

type InquiryRelatedActiveInquiriesSectionProps = {
  readonly inquiries: readonly UserProductInquiryDetailRelatedActiveInquiry[];
  readonly onOpenInquiry: (inquiryId: string) => void;
};

const STATUS_LABEL = INQUIRY_STATUS_LABEL;
const STATUS_COLOR = INQUIRY_STATUS_COLOR;
const EMPTY_DISPLAY = "—";

function formatContactFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

function displayText(value: unknown): string {
  if (value == null) {
    return EMPTY_DISPLAY;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : EMPTY_DISPLAY;
}

function buildPhoneTelHref(phone: unknown): string | null {
  if (phone == null) {
    return null;
  }

  const tel = toWesternDigits(String(phone).trim()).replace(/[^\d+]/g, "");
  return tel.length > 0 ? `tel:${tel}` : null;
}

function PhoneFieldValue({ phone }: { readonly phone: unknown }): ReactElement {
  const display = displayText(phone);
  const href = buildPhoneTelHref(phone);

  if (!href) {
    return (
      <Typography
        component="span"
        variant="body2"
        fontWeight={600}
        className={styles.phoneValue}
      >
        {display}
      </Typography>
    );
  }

  return (
    <Typography
      component="a"
      href={href}
      variant="body2"
      fontWeight={600}
      className={styles.phoneLink}
      onClick={(event) => event.stopPropagation()}
    >
      {display}
    </Typography>
  );
}

function RelatedInquiryStatusChip({
  status,
}: {
  readonly status: UserProductInquiryStatus;
}): ReactElement {
  return (
    <Chip
      size="small"
      variant="outlined"
      color={STATUS_COLOR[status] ?? "default"}
      label={STATUS_LABEL[status] ?? status}
      className={styles.statusChip}
    />
  );
}

function InquiryRelatedActiveInquiriesSection({
  inquiries,
  onOpenInquiry,
}: InquiryRelatedActiveInquiriesSectionProps): ReactElement | null {
  const { t } = useTranslation();

  if (inquiries.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1.25}>
      <Alert severity="info" variant="outlined" className={styles.alert}>
        {t("pages.inquiries.viewModal.relatedActiveInquiries.description")}
      </Alert>

      <List disablePadding className={styles.list}>
        {inquiries.map((inquiry) => {
          const fullName = displayText(
            formatContactFullName(inquiry.firstName, inquiry.lastName),
          );
          const phone = displayText(inquiry.phone);

          return (
            <ListItemButton
              key={inquiry.id}
              className={styles.listItem}
              onClick={() => onOpenInquiry(inquiry.id)}
              aria-label={t("pages.inquiries.viewModal.relatedActiveInquiries.openInquiry")}
            >
              <div className={styles.listItemBody}>
                <div className={styles.listItemHeader}>
                  <div className={styles.listItemHeaderStart}>
                    <RelatedInquiryStatusChip status={inquiry.status} />
                  </div>
                  <span className={styles.requestedAt}>
                    <DateTimeValue value={inquiry.requestedAt} emphasizeDate inlineDateTime />
                  </span>
                </div>

                <Typography variant="body2" fontWeight={700} className={styles.identityRow}>
                  <span>{fullName}</span>
                  {phone !== EMPTY_DISPLAY ? (
                    <span className={styles.phoneWrap}>
                      {" ("}
                      <PhoneFieldValue phone={inquiry.phone} />
                      {")"}
                    </span>
                  ) : null}
                </Typography>
              </div>

              <ChevronLeftRoundedIcon fontSize="small" className={styles.chevron} aria-hidden="true" />
            </ListItemButton>
          );
        })}
      </List>
    </Stack>
  );
}

export default InquiryRelatedActiveInquiriesSection;
