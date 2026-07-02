import { useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import type { UserProductInquiryDetailRecord } from "./inquiry-detail.api";
import type { UserProductInquiryStatus } from "./inquiries-list.api";
import {
  INQUIRY_STATUS_COLOR,
  INQUIRY_STATUS_LABEL,
} from "./inquiries-status.shared";
import { ProductDetailCoverGallery } from "../Products/ProductDetailCoverGallery";
import { useTranslation } from "../../hooks/useTranslation";
import EntityModalShell from "../../shared/crud/EntityModalShell";
import ModalFooterActions from "../../shared/crud/ModalFooterActions";
import DateTimeValue from "../../shared/display/DateTimeValue";
import InquiryStatusHistoryTimeline from "./InquiryStatusHistoryTimeline";
import InquiryStatusEditSection, {
  type InquiryStatusEditSectionHandle,
} from "./InquiryStatusEditSection";
import InquiryPreviewImageCarousel from "./InquiryPreviewImageCarousel";
import InquiryPreviewEntryPanel from "./InquiryPreviewEntryPanel";
import InquiryRelatedActiveInquiriesSection from "./InquiryRelatedActiveInquiriesSection";
import CollapsibleDetailSection from "./CollapsibleDetailSection";
import { formatSectionTitleWithCount } from "./inquiry-section-title.util";
import {
  findLatestContactedDetails,
  findLatestSaleCompletedDetails,
} from "./inquiry-sale-payload.util";
import { toWesternDigits } from "../../utilities/persian-digits.util";
import styles from "./styles/InquiryViewModal.module.scss";

type InquiryViewModalProps = {
  readonly open: boolean;
  readonly loading: boolean;
  readonly record: UserProductInquiryDetailRecord | null;
  readonly onClose: () => void;
  readonly onStatusEditSuccess?: () => void;
  readonly onOpenRelatedInquiry?: (inquiryId: string) => void;
};

const EMPTY_DISPLAY = "—";

const STATUS_LABEL = INQUIRY_STATUS_LABEL;
const STATUS_COLOR = INQUIRY_STATUS_COLOR;

type DetailField = {
  readonly label: string;
  readonly value: ReactNode;
  readonly latin?: boolean;
  readonly fullWidth?: boolean;
};

function displayText(value: unknown): string {
  if (value == null) {
    return EMPTY_DISPLAY;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : EMPTY_DISPLAY;
}

function formatContactFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
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
      <Typography variant="body2" fontWeight={600} className={styles.latinValue} sx={{ overflowWrap: "anywhere" }}>
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
      sx={{ overflowWrap: "anywhere" }}
    >
      {display}
    </Typography>
  );
}

function DetailSection({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <section className={styles.section}>
      <Typography variant="subtitle1" fontWeight={800} component="h3" gutterBottom>
        {title}
      </Typography>
      {children}
    </section>
  );
}

function DetailFieldValue({
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

function DetailFieldGrid({ fields }: { readonly fields: readonly DetailField[] }): ReactElement {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.25,
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      }}
    >
      {fields.map((field) => (
        <Box key={field.label} sx={field.fullWidth ? { gridColumn: "1 / -1" } : undefined}>
          <Typography variant="caption" color="text.secondary" display="block">
            {field.label}
          </Typography>
          <Box sx={{ mt: 0.25 }}>
            <DetailFieldValue value={field.value} latin={field.latin} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function StatusChip({ status }: { readonly status: UserProductInquiryStatus }): ReactElement {
  return (
    <Chip
      size="small"
      variant="outlined"
      color={STATUS_COLOR[status] ?? "default"}
      label={STATUS_LABEL[status] ?? status}
    />
  );
}

function InquiryViewModal({
  open,
  loading,
  record,
  onClose,
  onStatusEditSuccess,
  onOpenRelatedInquiry,
}: InquiryViewModalProps): ReactElement | null {
  const { t } = useTranslation();
  const statusEditRef = useRef<InquiryStatusEditSectionHandle>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusCanSubmit, setStatusCanSubmit] = useState(false);
  const initialContacted = useMemo(
    () => (record ? findLatestContactedDetails(record.statusHistory) : null),
    [record],
  );
  const initialSaleCompleted = useMemo(
    () => (record ? findLatestSaleCompletedDetails(record.statusHistory) : null),
    [record],
  );
  const previewCount = record?.preview?.length ?? 0;
  const statusHistoryCount = record?.statusHistory.length ?? 0;

  if (!open) {
    return null;
  }

  const subtitle =
    record?.product.title?.trim() ||
    record?.user.fullName?.trim() ||
    t("pages.inquiries.viewModal.subtitle");

  return (
    <EntityModalShell
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={t("pages.inquiries.viewModal.title")}
      subtitle={subtitle}
      disableClose={statusSubmitting}
      footer={
        <ModalFooterActions
          actions={[
            {
              key: "close",
              isCloseButton: true,
              onClick: onClose,
              disabled: statusSubmitting,
            },
            ...(record && !loading
              ? [
                  {
                    key: "submit-status",
                    label: t("pages.inquiries.statusEdit.submit"),
                    onClick: (): void => {
                      statusEditRef.current?.submit();
                    },
                    disabled: statusSubmitting || !statusCanSubmit,
                  },
                ]
              : []),
          ]}
        />
      }
      pinFooterToBottomOnMobile
    >
      {loading || !record ? (
        <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 320 }}>
          <CircularProgress />
          <Typography color="text.secondary" variant="body2">
            {t("pages.inquiries.viewModal.loading")}
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <section className={styles.productGallerySection}>
            <div className={styles.productGallery}>
              <ProductDetailCoverGallery
                title={record.product.title}
                coverImageAccessUrls={record.product.coverImageAccessUrls}
              />
            </div>
          </section>

          <DetailSection title={t("pages.inquiries.viewModal.sections.general")}>
            <DetailFieldGrid
              fields={[
                {
                  label: t("table.pages.inquiries.columns.status"),
                  value: <StatusChip status={record.status} />,
                },
              ]}
            />
          </DetailSection>

          <DetailSection title={t("pages.inquiries.viewModal.sections.user")}>
            <DetailFieldGrid
              fields={[
                {
                  label: t("table.pages.inquiries.columns.userFullName"),
                  value: displayText(record.user.fullName),
                },
                {
                  label: t("table.pages.inquiries.columns.username"),
                  value: displayText(record.user.username),
                  latin: true,
                },
                {
                  label: t("table.pages.inquiries.columns.userPhone"),
                  value: <PhoneFieldValue phone={record.user.phoneNumber} />,
                },
              ]}
            />
          </DetailSection>

          <DetailSection title={t("pages.inquiries.viewModal.sections.contact")}>
            {record.contact ? (
              <DetailFieldGrid
                fields={[
                  {
                    label: t("table.pages.inquiries.columns.contactFullName"),
                    value: displayText(
                      formatContactFullName(record.contact.firstName, record.contact.lastName),
                    ),
                    fullWidth: true,
                  },
                  {
                    label: t("table.pages.inquiries.columns.contactPhone"),
                    value: <PhoneFieldValue phone={record.contact.phone} />,
                  },
                  {
                    label: t("table.pages.inquiries.columns.contactRequestedAt"),
                    value: <DateTimeValue value={record.contact.requestedAt} emphasizeDate />,
                  },
                  {
                    label: t("pages.inquiries.viewModal.fields.customerNote"),
                    value: (
                      <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                        {displayText(record.contact.customerNote)}
                      </Typography>
                    ),
                    fullWidth: true,
                  },
                ]}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {EMPTY_DISPLAY}
              </Typography>
            )}
          </DetailSection>

          <DetailSection
            title={formatSectionTitleWithCount(
              t("pages.inquiries.viewModal.sections.preview"),
              previewCount,
            )}
          >
            {record.preview?.length ? (
              <Stack spacing={1.25}>
                {record.preview.map((preview, index) => (
                  <InquiryPreviewEntryPanel
                    key={`${preview.resultFileId}-${preview.generatedAt}-${index}`}
                    title={
                      record.preview!.length > 1
                        ? t("pages.inquiries.viewModal.fields.previewEntry", {
                            index: toWesternDigits(String(index + 1)),
                          })
                        : t("pages.inquiries.viewModal.sections.preview")
                    }
                    summary={<DateTimeValue value={preview.generatedAt} emphasizeDate />}
                  >
                    <Stack spacing={1.5}>
                      <DetailFieldGrid
                        fields={[
                          {
                            label: t("table.pages.inquiries.columns.previewGeneratedAt"),
                            value: <DateTimeValue value={preview.generatedAt} emphasizeDate />,
                          },
                          {
                            label: t("pages.inquiries.viewModal.fields.durationSeconds"),
                            value: displayText(preview.durationSeconds),
                            latin: true,
                          },
                          {
                            label: t("pages.inquiries.viewModal.fields.modelProvider"),
                            value: displayText(preview.model.provider),
                            latin: true,
                          },
                          {
                            label: t("pages.inquiries.viewModal.fields.modelName"),
                            value: displayText(preview.model.model),
                            latin: true,
                          },
                          {
                            label: t("pages.inquiries.viewModal.fields.aspectRatio"),
                            value: displayText(preview.model.aspectRatio),
                            latin: true,
                          },
                          {
                            label: t("pages.inquiries.viewModal.fields.imageSize"),
                            value: displayText(preview.model.imageSize),
                            latin: true,
                          },
                          {
                            label: t("pages.inquiries.viewModal.fields.reasoningEffort"),
                            value: displayText(preview.model.reasoningEffort),
                            latin: true,
                          },
                        ]}
                      />
                      <InquiryPreviewImageCarousel
                        preview={preview}
                        title={record.product.title}
                      />
                    </Stack>
                  </InquiryPreviewEntryPanel>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {EMPTY_DISPLAY}
              </Typography>
            )}
          </DetailSection>

          {record.relatedActiveInquiries.length > 0 && onOpenRelatedInquiry ? (
            <CollapsibleDetailSection
              title={formatSectionTitleWithCount(
                t("pages.inquiries.viewModal.relatedActiveInquiries.title"),
                record.relatedActiveInquiries.length,
              )}
            >
              <InquiryRelatedActiveInquiriesSection
                inquiries={record.relatedActiveInquiries}
                onOpenInquiry={onOpenRelatedInquiry}
              />
            </CollapsibleDetailSection>
          ) : null}

          <CollapsibleDetailSection
            key={record.id}
            title={formatSectionTitleWithCount(
              t("pages.inquiries.viewModal.sections.statusHistory"),
              statusHistoryCount,
            )}
          >
            <InquiryStatusHistoryTimeline
              entries={record.statusHistory}
              emptyLabel={t("pages.inquiries.historyModal.empty")}
            />
          </CollapsibleDetailSection>

          <DetailSection title={t("pages.inquiries.viewModal.sections.audit")}>
            <DetailFieldGrid
              fields={[
                {
                  label: t("table.pages.inquiries.columns.createdAt"),
                  value: <DateTimeValue value={record.createdAt ?? ""} emphasizeDate />,
                },
                {
                  label: t("table.pages.inquiries.columns.updatedAt"),
                  value: <DateTimeValue value={record.updatedAt ?? ""} emphasizeDate />,
                },
              ]}
            />
          </DetailSection>

          <DetailSection title={t("pages.inquiries.statusEdit.title")}>
            <InquiryStatusEditSection
              ref={statusEditRef}
              inquiryId={record.id}
              initialStatus={record.status}
              initialContacted={initialContacted}
              initialSaleCompleted={initialSaleCompleted}
              onSuccess={onStatusEditSuccess}
              onSubmittingChange={setStatusSubmitting}
              onCanSubmitChange={setStatusCanSubmit}
            />
          </DetailSection>
        </Stack>
      )}
    </EntityModalShell>
  );
}

export default InquiryViewModal;
