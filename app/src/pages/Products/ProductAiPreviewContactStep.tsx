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

import {
  PRODUCT_AI_PREVIEW_CONTACT_ACTIVE_REQUEST_BANNER,
  PRODUCT_AI_PREVIEW_CONTACT_DIALOG_LEAD,
  PRODUCT_AI_PREVIEW_CONTACT_SUBMITTED_LEAD,
} from "./product-ai-preview.constants";
import {
  checkUserProductInquiryHasActiveRequest,
  getProductAiPreviewErrorMessage,
  submitUserProductInquiryContact,
} from "./product-ai-preview.api";
import type { ProductAiPreviewSubmittedContact } from "./product-ai-preview-contact.util";
import { useAuth } from "../../contexts/AuthContext";
import { useMe } from "../../hooks/useMe";
import { useSnackbar } from "../../hooks/useSnackbar";
import { LoginAdornedTextField } from "../Login/components/LoginAdornedTextField";
import formStyles from "../Login/styles/LoginFormShared.module.scss";
import contactStyles from "./styles/ProductAiPreviewContactStep.module.scss";
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
  readonly readonlyContact?: ProductAiPreviewSubmittedContact | null;
  readonly onSubmittingChange?: (submitting: boolean) => void;
  readonly onCanSubmitChange?: (canSubmit: boolean) => void;
  readonly onMePrefillSlowBannerChange?: (visible: boolean) => void;
  readonly onSubmitted?: (contact: ProductAiPreviewSubmittedContact) => void;
};

const ME_PREFILL_SLOW_BANNER_DELAY_MS = 2000;
const ACTIVE_REQUEST_CHECK_DEBOUNCE_MS = 400;

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

type SubmittedContactFieldProps = {
  readonly icon: ReactElement;
  readonly label: string;
  readonly value: string;
  readonly latin?: boolean;
};

function SubmittedContactField({
  icon,
  label,
  value,
  latin = false,
}: SubmittedContactFieldProps): ReactElement {
  return (
    <div className={contactStyles.fieldRow}>
      <span className={contactStyles.fieldIconWrap} aria-hidden="true">
        {icon}
      </span>
      <div className={contactStyles.fieldContent}>
        <Typography className={contactStyles.fieldLabel} component="p" variant="caption">
          {label}
        </Typography>
        <Typography
          className={`${contactStyles.fieldValue}${latin ? ` ${contactStyles.fieldValueLatin}` : ""}`}
          component="p"
          variant="body1"
        >
          {value}
        </Typography>
      </div>
    </div>
  );
}

function ProductAiPreviewContactStepInner(
  {
    productId,
    inquiryId,
    fabricKey,
    colorKey,
    readonlyContact = null,
    onSubmittingChange,
    onCanSubmitChange,
    onMePrefillSlowBannerChange,
    onSubmitted,
  }: ProductAiPreviewContactStepProps,
  ref: Ref<ProductAiPreviewContactStepHandle>,
): ReactElement {
  const isReadonly = readonlyContact !== null;

  const { isAnonymousUser } = useAuth();
  const { user: meUser, loading: meLoading } = useMe();
  const { showError } = useSnackbar();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState<boolean | null>(null);

  useEffect(() => {
    if (isReadonly) {
      return;
    }

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
  }, [isAnonymousUser, isReadonly, meLoading, meUser, prefilled]);

  useEffect(() => {
    const shouldTrackSlowPrefill =
      !isReadonly && !isAnonymousUser && meLoading && !prefilled;

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
  }, [isAnonymousUser, isReadonly, meLoading, onMePrefillSlowBannerChange, prefilled]);

  const phoneInvalid = Boolean(phone.trim()) && !isValidMobilePhone(phone);
  const isPhoneValid = Boolean(phone.trim()) && !phoneInvalid;
  const isFormValid =
    Boolean(fullName.trim()) && Boolean(phone.trim()) && !phoneInvalid;

  useEffect(() => {
    if (isReadonly || !isPhoneValid) {
      setHasActiveRequest(null);
      return undefined;
    }

    const normalizedPhone = normalizeAuthIdentityMobileForSubmit(phone.trim());
    if (!normalizedPhone) {
      setHasActiveRequest(false);
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void checkUserProductInquiryHasActiveRequest({
        productId,
        phone: normalizedPhone,
      })
        .then((active) => {
          if (!cancelled) {
            setHasActiveRequest(active);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setHasActiveRequest(false);
          }
        });
    }, ACTIVE_REQUEST_CHECK_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isPhoneValid, isReadonly, phone, productId]);

  useEffect(() => {
    if (isReadonly) {
      onSubmittingChange?.(false);
      onCanSubmitChange?.(false);
      return;
    }

    onSubmittingChange?.(submitting);
    onCanSubmitChange?.(isFormValid);
  }, [isFormValid, isReadonly, onCanSubmitChange, onSubmittingChange, submitting]);

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

  if (isReadonly && readonlyContact) {
    const readonlyPhone =
      normalizeOptionalMobilePhoneToLocal(readonlyContact.phone) ?? readonlyContact.phone;

    return (
      <div className={contactStyles.root}>
        <Typography className={contactStyles.lead} color="text.secondary" variant="body2">
          {PRODUCT_AI_PREVIEW_CONTACT_SUBMITTED_LEAD}
        </Typography>
        <div className={contactStyles.detailsPanel}>
          <SubmittedContactField
            icon={<PersonIcon className={contactStyles.fieldIcon} />}
            label="نام و نام خانوادگی"
            value={readonlyContact.fullName}
          />
          <SubmittedContactField
            icon={<PhoneIcon className={contactStyles.fieldIcon} />}
            label="شماره موبایل"
            latin
            value={readonlyPhone}
          />
        </div>
      </div>
    );
  }

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
        {isPhoneValid && hasActiveRequest ? (
          <Alert severity="info" variant="outlined">
            {PRODUCT_AI_PREVIEW_CONTACT_ACTIVE_REQUEST_BANNER}
          </Alert>
        ) : null}
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}
      </Stack>
    </form>
  );
}

export const ProductAiPreviewContactStep = memo(forwardRef(ProductAiPreviewContactStepInner));
ProductAiPreviewContactStep.displayName = "ProductAiPreviewContactStep";
