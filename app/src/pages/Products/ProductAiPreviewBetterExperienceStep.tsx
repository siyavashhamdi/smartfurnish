import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Alert, Stack, Typography } from "@mui/material";
import { memo, type ReactElement } from "react";

import {
  PRODUCT_AI_PREVIEW_BETTER_EXPERIENCE_SIGNUP_LEAD,
  PRODUCT_AI_PREVIEW_CONTACT_SUCCESS_MESSAGE,
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
};

function ProductAiPreviewBetterExperienceStepInner({
  showSignupForm,
  contactPrefill,
}: ProductAiPreviewBetterExperienceStepProps): ReactElement {
  const trimmedPhone = contactPrefill?.phone.trim() ?? "";
  const showSignup = showSignupForm && trimmedPhone.length > 0;

  return (
    <Stack
      className={`${styles.root}${showSignup ? "" : ` ${styles.successOnly}`}`}
      spacing={2.5}
    >
      <Alert
        className={styles.successAlert}
        icon={<CheckCircleRoundedIcon fontSize="inherit" />}
        severity="success"
        variant="outlined"
      >
        {PRODUCT_AI_PREVIEW_CONTACT_SUCCESS_MESSAGE}
      </Alert>

      {showSignup && contactPrefill ? (
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
          />
        </>
      ) : null}
    </Stack>
  );
}

export const ProductAiPreviewBetterExperienceStep = memo(ProductAiPreviewBetterExperienceStepInner);
