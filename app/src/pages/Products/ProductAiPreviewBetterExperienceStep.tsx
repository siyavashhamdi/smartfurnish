import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Stack, Typography } from "@mui/material";
import { forwardRef, memo, useImperativeHandle, useRef, type ReactElement, type Ref } from "react";

import {
  PRODUCT_AI_PREVIEW_BETTER_EXPERIENCE_SIGNUP_LEAD,
  PRODUCT_AI_PREVIEW_CONTACT_SUCCESS_MESSAGE,
  PRODUCT_AI_PREVIEW_CONTACT_SUCCESS_CLOSING,
  PRODUCT_AI_PREVIEW_CONTACT_SUCCESS_TITLE,
} from "./product-ai-preview.constants";
import { SignupForm, type SignupFormHandle } from "../Login/SignupForm";
import styles from "./styles/ProductAiPreviewBetterExperienceStep.module.scss";

type ProductAiPreviewContactPrefill = {
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
};

export type ProductAiPreviewBetterExperienceStepHandle = SignupFormHandle;

type ProductAiPreviewBetterExperienceStepProps = {
  readonly showSignupForm: boolean;
  readonly contactPrefill: ProductAiPreviewContactPrefill | null;
  readonly inquiryId: string | null;
  readonly onSignupComplete?: () => void;
  readonly onSubmittingChange?: (submitting: boolean) => void;
};

function ProductAiPreviewBetterExperienceStepInner(
  {
    showSignupForm,
    contactPrefill,
    inquiryId,
    onSignupComplete,
    onSubmittingChange,
  }: ProductAiPreviewBetterExperienceStepProps,
  ref: Ref<ProductAiPreviewBetterExperienceStepHandle>,
): ReactElement {
  const signupFormRef = useRef<SignupFormHandle>(null);
  const showSignup = showSignupForm && Boolean(inquiryId);
  const prefillPhone = contactPrefill?.phone.trim() ?? "";

  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        signupFormRef.current?.submit();
      },
    }),
    [],
  );

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

      {showSignup && inquiryId ? (
        <>
          <Typography className={styles.signupLead} color="text.secondary" variant="body2">
            {PRODUCT_AI_PREVIEW_BETTER_EXPERIENCE_SIGNUP_LEAD}
          </Typography>
          <SignupForm
            ref={signupFormRef}
            embedded
            hideCredentialHeader
            hideFormLead
            hideSubmitButton
            allowEditableMobile
            identity={{ identity: prefillPhone, identityKind: "mobile" }}
            initialFirstName={contactPrefill?.firstName ?? ""}
            initialLastName={contactPrefill?.lastName ?? ""}
            onEditIdentity={() => undefined}
            onSubmittingChange={onSubmittingChange}
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

export const ProductAiPreviewBetterExperienceStep = memo(
  forwardRef(ProductAiPreviewBetterExperienceStepInner),
);
ProductAiPreviewBetterExperienceStep.displayName = "ProductAiPreviewBetterExperienceStep";
