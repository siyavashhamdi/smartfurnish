import {
  Person as PersonIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { Alert, InputAdornment, Stack, Typography } from "@mui/material";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
  type Ref,
} from "react";

import { PRODUCT_AI_PREVIEW_CONTACT_DIALOG_LEAD } from "./product-ai-preview.constants";
import {
  getProductAiPreviewErrorMessage,
  submitUserProductInquiryContact,
} from "./product-ai-preview.api";
import type { ProductAiPreviewSubmittedContact } from "./product-ai-preview-contact.util";
import { useAuth } from "../../contexts/AuthContext";
import { useMe } from "../../hooks/useMe";
import { useSnackbar } from "../../hooks/useSnackbar";
import { LoginAdornedTextField } from "../Login/components/LoginAdornedTextField";
import formStyles from "../Login/styles/LoginFormShared.module.scss";
import {
  isValidMobilePhone,
  normalizeAuthIdentityMobileForSubmit,
  normalizeOptionalMobilePhoneToLocal,
  sanitizeMobilePhoneInput,
} from "../../utilities/mobile-phone.util";

export type ProductAiPreviewContactStepHandle = {
  readonly submit: () => void;
};

type ProductAiPreviewContactStepProps = {
  readonly productId: string;
  readonly inquiryId: string | null;
  readonly fabricKey: string | null;
  readonly colorKey: string | null;
  readonly onSubmittingChange?: (submitting: boolean) => void;
  readonly onCanSubmitChange?: (canSubmit: boolean) => void;
  readonly onMePrefillSlowBannerChange?: (visible: boolean) => void;
  readonly onSubmitted?: (contact: ProductAiPreviewSubmittedContact) => void;
};

const ME_PREFILL_SLOW_BANNER_DELAY_MS = 2000;

const persianFieldInputProps = {
  className: formStyles.persianInput,
  dir: "rtl",
} as const;

const latinFieldInputProps = {
  className: formStyles.latinInput,
  dir: "ltr",
  lang: "en",
  spellCheck: "false",
  autoCapitalize: "off",
  autoCorrect: "off",
} as const;

const fullNameInputProps = {
  startAdornment: (
    <InputAdornment position="start">
      <PersonIcon className={formStyles.inputIcon} />
    </InputAdornment>
  ),
};

const phoneInputProps = {
  startAdornment: (
    <InputAdornment position="start">
      <PhoneIcon className={formStyles.inputIcon} />
    </InputAdornment>
  ),
};

function resolveDefaultFullName(
  firstName?: string | null,
  lastName?: string | null,
): string {
  return [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
}

function resolveDefaultPhone(phoneNumber?: string | null): string {
  return normalizeOptionalMobilePhoneToLocal(phoneNumber ?? "") ?? "";
}

function ProductAiPreviewContactStepInner(
  {
    productId,
    inquiryId,
    fabricKey,
    colorKey,
    onSubmittingChange,
    onCanSubmitChange,
    onMePrefillSlowBannerChange,
    onSubmitted,
  }: ProductAiPreviewContactStepProps,
  ref: Ref<ProductAiPreviewContactStepHandle>,
): ReactElement {
  const { isAnonymousUser } = useAuth();
  const { user: meUser, loading: meLoading } = useMe();
  const { showError } = useSnackbar();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (prefilled) {
      return;
    }

    if (isAnonymousUser) {
      setFullName("");
      setPhone("");
      setPrefilled(true);
      return;
    }

    if (meLoading) {
      return;
    }

    setFullName(
      resolveDefaultFullName(meUser?.profile?.firstName, meUser?.profile?.lastName),
    );
    setPhone(resolveDefaultPhone(meUser?.profile?.phoneNumber));
    setPrefilled(true);
  }, [isAnonymousUser, meLoading, meUser, prefilled]);

  useEffect(() => {
    const shouldTrackSlowPrefill = !isAnonymousUser && meLoading && !prefilled;

    if (!shouldTrackSlowPrefill) {
      onMePrefillSlowBannerChange?.(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onMePrefillSlowBannerChange?.(true);
    }, ME_PREFILL_SLOW_BANNER_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      onMePrefillSlowBannerChange?.(false);
    };
  }, [isAnonymousUser, meLoading, onMePrefillSlowBannerChange, prefilled]);

  const phoneInvalid = Boolean(phone.trim()) && !isValidMobilePhone(phone);
  const isFormValid =
    Boolean(fullName.trim()) && Boolean(phone.trim()) && !phoneInvalid;

  useEffect(() => {
    onSubmittingChange?.(submitting);
    onCanSubmitChange?.(isFormValid);
  }, [isFormValid, onCanSubmitChange, onSubmittingChange, submitting]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!isFormValid || submitting) {
      return;
    }

    const normalizedPhone = normalizeAuthIdentityMobileForSubmit(phone.trim());
    if (!normalizedPhone) {
      setSubmitError("شماره موبایل وارد شده معتبر نیست.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const inquiry = await submitUserProductInquiryContact({
        colorKey,
        fabricKey,
        fullName: fullName.trim(),
        inquiryId,
        phone: normalizedPhone,
        productId,
      });

      onSubmitted?.({
        inquiryId: inquiry.id,
        fullName: fullName.trim(),
        phone,
      });
    } catch (error) {
      const message = getProductAiPreviewErrorMessage(
        error,
        "امکان ثبت درخواست بازدید حضوری وجود ندارد. لطفاً دوباره تلاش کنید.",
      );
      setSubmitError(message);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    colorKey,
    fabricKey,
    fullName,
    inquiryId,
    isFormValid,
    onSubmitted,
    phone,
    productId,
    showError,
    submitting,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        void handleSubmit();
      },
    }),
    [handleSubmit],
  );

  const handleFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      void handleSubmit();
    },
    [handleSubmit],
  );

  const handleFullNameChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setFullName(event.target.value);
  }, []);

  const handlePhoneChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setPhone(sanitizeMobilePhoneInput(event.target.value));
  }, []);

  return (
    <form id="product-ai-preview-contact-step-form" onSubmit={handleFormSubmit}>
      <Stack spacing={2.5}>
        <Typography color="text.secondary" variant="body2">
          {PRODUCT_AI_PREVIEW_CONTACT_DIALOG_LEAD}
        </Typography>
        <LoginAdornedTextField
          label="نام و نام خانوادگی"
          value={fullName}
          onChange={handleFullNameChange}
          required
          fullWidth
          size="small"
          autoComplete="name"
          disabled={submitting}
          className={formStyles.persianAdornedTextField}
          inputProps={persianFieldInputProps}
          InputProps={fullNameInputProps}
        />
        <LoginAdornedTextField
          label="شماره موبایل"
          value={phone}
          onChange={handlePhoneChange}
          required
          fullWidth
          size="small"
          autoComplete="tel"
          inputMode="tel"
          disabled={submitting}
          error={phoneInvalid}
          helperText={phoneInvalid ? "شماره موبایل وارد شده معتبر نیست." : undefined}
          inputProps={latinFieldInputProps}
          InputProps={phoneInputProps}
        />
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}
      </Stack>
    </form>
  );
}

export const ProductAiPreviewContactStep = memo(forwardRef(ProductAiPreviewContactStepInner));
ProductAiPreviewContactStep.displayName = "ProductAiPreviewContactStep";
