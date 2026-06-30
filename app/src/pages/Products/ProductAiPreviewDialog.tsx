import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { Typography } from "@mui/material";
import type { ReactElement } from "react";

import { FabricSelector } from "./FabricSelector";
import {
  IN_PERSON_VISIT_BUTTON_LABEL,
} from "./product-ai-preview.constants";
import type { FabricSelectionController } from "./useFabricSelection";
import { useTranslation } from "../../hooks/useTranslation";
import EntityModalShell from "../../shared/crud/EntityModalShell";
import ModalFooterActions from "../../shared/crud/ModalFooterActions";
import styles from "./styles/ProductAiPreviewDialog.module.scss";

type ProductAiPreviewDialogProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly fabricSelection: FabricSelectionController;
  readonly onInPersonVisitClick: () => void;
};

export function ProductAiPreviewDialog({
  open,
  onClose,
  fabricSelection,
  onInPersonVisitClick,
}: ProductAiPreviewDialogProps): ReactElement {
  const { t } = useTranslation();

  return (
    <EntityModalShell
      open={open}
      onClose={onClose}
      title={t("app.pageTitles.productAiPreview")}
      maxWidth="sm"
      footer={
        <ModalFooterActions
          actions={[
            { key: "close", isCloseButton: true, onClick: onClose },
            {
              key: "in-person-visit",
              label: IN_PERSON_VISIT_BUTTON_LABEL,
              variant: "outlined",
              color: "primary",
              icon: <StorefrontRoundedIcon />,
              onClick: onInPersonVisitClick,
            },
          ]}
        />
      }
    >
      <div className={styles.body}>
        <FabricSelector fabricSelection={fabricSelection} showSectionTitle />

        <div className={styles.comingSoon}>
          <div className={styles.iconWrap} aria-hidden="true">
            <AutoAwesomeRoundedIcon className={styles.icon} />
          </div>
          <Typography className={styles.message} component="p" variant="h6">
            به زودی
          </Typography>
        </div>
      </div>
    </EntityModalShell>
  );
}
