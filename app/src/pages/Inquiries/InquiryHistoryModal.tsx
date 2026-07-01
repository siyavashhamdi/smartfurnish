import { type ReactElement } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import type { UserProductInquiryDetailRecord } from "./inquiry-detail.api";
import InquiryStatusHistoryTimeline from "./InquiryStatusHistoryTimeline";
import { useTranslation } from "../../hooks/useTranslation";
import EntityModalShell from "../../shared/crud/EntityModalShell";
import ModalFooterActions from "../../shared/crud/ModalFooterActions";

type InquiryHistoryModalProps = {
  readonly open: boolean;
  readonly loading: boolean;
  readonly record: UserProductInquiryDetailRecord | null;
  readonly subtitle?: string;
  readonly onClose: () => void;
};

function InquiryHistoryModal({
  open,
  loading,
  record,
  subtitle,
  onClose,
}: InquiryHistoryModalProps): ReactElement | null {
  const { t } = useTranslation();

  if (!open) {
    return null;
  }

  return (
    <EntityModalShell
      open={open}
      onClose={onClose}
      maxWidth="md"
      title={t("pages.inquiries.historyModal.title")}
      subtitle={subtitle ?? record?.product.title}
      showVisibleScrollbar
      footer={
        <ModalFooterActions
          actions={[
            {
              key: "close",
              isCloseButton: true,
              onClick: onClose,
            },
          ]}
        />
      }
    >
      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }} spacing={1.5}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            {t("pages.inquiries.historyModal.loading")}
          </Typography>
        </Stack>
      ) : record ? (
        <Box sx={{ py: 0.5 }}>
          <InquiryStatusHistoryTimeline
            entries={record.statusHistory}
            emptyLabel={t("pages.inquiries.historyModal.empty")}
          />
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          {t("errors.general.loadData")}
        </Typography>
      )}
    </EntityModalShell>
  );
}

export default InquiryHistoryModal;
