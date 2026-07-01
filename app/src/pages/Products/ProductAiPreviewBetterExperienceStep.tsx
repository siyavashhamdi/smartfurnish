import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Stack, Typography } from "@mui/material";
import { memo, type ReactElement } from "react";

import {
  PRODUCT_AI_PREVIEW_BETTER_EXPERIENCE_SIGNUP_LEAD,
  PRODUCT_AI_PREVIEW_CONTACT_SUCCESS_MESSAGE,
  PRODUCT_AI_PREVIEW_CONTACT_SUCCESS_CLOSING,
  PRODUCT_AI_PREVIEW_CONTACT_SUCCESS_TITLE,
} from "./product-ai-preview.constants";
import { SignupForm } from "../Login/SignupForm";
import styles from "./styles/ProductAiPreviewBetterExperienceStep.module.scss";

type ProductAiPreviewContactPrefill = {
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
};

type ProductAiPreviewBetterExperienceStepProps = {
  readonly showSignupForm: boolean;
  readonly contactPrefill: ProductAiPreviewContactPrefill | null;
  readonly inquiryId: string | null;
  readonly onSignupComplete?: () => void;
};

function ProductAiPreviewBetterExperienceStepInner({
  showSignupForm,
  contactPrefill,
  inquiryId,
  onSignupComplete,
}: ProductAiPreviewBetterExperienceStepProps): ReactElement {
  const trimmedPhone = contactPrefill?.phone.trim() ?? "";
  const showSignup = showSignupForm && Boolean(inquiryId) && trimmedPhone.length > 0;

  return (
    <Stack
      className={`${styles.root}${showSignup ? "" : ` ${styles.successOnly}`}`}
      spacing={2.5}
    >
      <div className={styles.successPanel} role="status" aria-live="polite">
        <span className={styles.successIconWrap} aria-hidden="true">
          <CheckCircleRoundedIcon className={styles.successIcon} />
        </span>
        <Typography className={styles.successTitle} component="p" variant="h6">
          {PRODUCT_AI_PREVIEW_CONTACT_SUCCESS_TITLE}
        </Typography>
        <Typography className={styles.successMessage} color="text.secondary" variant="body1">
          {PRODUCT_AI_PREVIEW_CONTACT_SUCCESS_MESSAGE}
        </Typography>
        <Typography className={styles.successClosing} color="text.secondary" variant="body2">
          {PRODUCT_AI_PREVIEW_CONTACT_SUCCESS_CLOSING}
        </Typography>
      </div>

      {showSignup && contactPrefill && inquiryId ? (
        <>
          <Typography className={styles.signupLead} color="text.secondary" variant="body2">
            {PRODUCT_AI_PREVIEW_BETTER_EXPERIENCE_SIGNUP_LEAD}
          </Typography>
          <SignupForm
            embedded
            hideCredentialHeader
            hideFormLead
            identity={{ identity: trimmedPhone, identityKind: "mobile" }}
            initialFirstName={contactPrefill.firstName}
            initialLastName={contactPrefill.lastName}
            onEditIdentity={() => undefined}
            embeddedInquiryFlow={{
              inquiryId,
              onSignupComplete,
            }}
          />
        </>
      ) : null}
    </Stack>
  );
}

export const ProductAiPreviewBetterExperienceStep = memo(ProductAiPreviewBetterExperienceStepInner);
