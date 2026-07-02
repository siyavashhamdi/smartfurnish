import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
  type Ref,
} from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  AlternateEmail as AlternateEmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Sms as SmsIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useTranslation } from "../../hooks/useTranslation";
import { useSnackbar } from "../../hooks/useSnackbar";
import { toWesternDigits } from "../../utilities/persian-digits.util";
import { useLogin } from "../../hooks/useLogin";
import { useAuth } from "../../contexts/AuthContext";
import { claimUserProductInquiryAfterSignup } from "../Products/product-ai-preview.api";
import { API_CONFIG } from "../../config/env";
import { SIGNUP_OTP_ENABLED } from "../../constants/authCredential.constants";
import LoginShell from "./LoginShell";
import { LoginCaptchaField } from "./components/LoginCaptchaField";
import { LoginAdornedTextField } from "./components/LoginAdornedTextField";
import { LoginCredentialHeader } from "./components/LoginCredentialHeader";
import { type LoginNavState } from "./login-nav-state";
import {
  isLatinEmailValue,
  isLatinIdentityUsername,
  isValidMobilePhone,
  sanitizeAuthIdentityInput,
  sanitizeLatinEmailInput,
} from "./password-reset-form.util";
import {
  sanitizeMobilePhoneInput,
  normalizeAuthIdentityMobileForSubmit,
} from "../../utilities/mobile-phone.util";
import { isValidUsernameLength } from "../../utils/usernamePolicy.util";
import { arePasswordRulesPassed } from "../../utils/passwordPolicy.util";
import formStyles from "./styles/LoginFormShared.module.scss";
import verifyStyles from "./styles/VerifyLoginCode.module.scss";

const latinFieldInputProps = {
  className: formStyles.latinInput,
  dir: "ltr",
  lang: "en",
  spellCheck: "false",
  autoCapitalize: "off",
  autoCorrect: "off",
} as const;

const persianFieldInputProps = {
  className: formStyles.persianInput,
  dir: "rtl",
} as const;

const VERIFICATION_CODE_LENGTH = 6;
const VERIFICATION_CODE_REGEX = /^\d{4,6}$/;
const EMPTY_DIGITS: readonly string[] = Array.from({ length: VERIFICATION_CODE_LENGTH }, () => "");

type SignupCredentialMode = "password" | "otp";

type SignupFormEmbeddedInquiryFlow = {
  readonly inquiryId: string;
  readonly onSignupComplete?: () => void;
};

export type SignupFormHandle = {
  readonly submit: () => void;
};

interface SignupFormProps {
  readonly embedded?: boolean;
  readonly identity: LoginNavState;
  readonly onEditIdentity: (identity: LoginNavState) => void;
  readonly initialFirstName?: string;
  readonly initialLastName?: string;
  readonly hideCredentialHeader?: boolean;
  readonly hideFormLead?: boolean;
  readonly hideSubmitButton?: boolean;
  readonly allowEditableMobile?: boolean;
  readonly onSubmittingChange?: (submitting: boolean) => void;
  readonly embeddedInquiryFlow?: SignupFormEmbeddedInquiryFlow;
}

function SignupFormInner(
  {
    embedded = false,
    identity,
    onEditIdentity,
    initialFirstName = "",
    initialLastName = "",
    hideCredentialHeader = false,
    hideFormLead = false,
    hideSubmitButton = false,
    allowEditableMobile = false,
    onSubmittingChange,
    embeddedInquiryFlow,
  }: SignupFormProps,
  ref: Ref<SignupFormHandle>,
): ReactElement {
  const { t } = useTranslation();
  const { showError } = useSnackbar();
  const { accessToken: anonymousAccessToken } = useAuth();
  const { signup, requestSignupCode, loading } = useLogin();

  const supportsOtp =
    SIGNUP_OTP_ENABLED && (identity.identityKind === "mobile" || allowEditableMobile);
  const [mode, setMode] = useState<SignupCredentialMode>("password");
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [username, setUsername] = useState(
    identity.identityKind === "username" ? identity.identity : ""
  );
  const [email, setEmail] = useState(identity.identityKind === "email" ? identity.identity : "");
  const [mobile, setMobile] = useState(identity.identityKind === "mobile" ? identity.identity : "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaId, setCaptchaId] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaVersion, setCaptchaVersion] = useState(0);
  const [signupCodeRequested, setSignupCodeRequested] = useState(false);
  const [verificationDigits, setVerificationDigits] = useState<string[]>(() => [...EMPTY_DIGITS]);
  const [hasError, setHasError] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const verificationCode = verificationDigits.join("");
  const captchaEnabled = API_CONFIG.CAPTCHA_ENABLED;
  const lockedIdentityKind = useMemo(() => {
    if (!identity.identity.trim()) {
      return null;
    }

    if (allowEditableMobile && identity.identityKind === "mobile") {
      return null;
    }

    return identity.identityKind;
  }, [allowEditableMobile, identity.identity, identity.identityKind]);
  const hasAnyIdentity = useMemo(
    () => Boolean(username.trim() || email.trim() || mobile.trim()),
    [email, mobile, username]
  );
  const passwordRulesPassed = arePasswordRulesPassed(password);
  const passwordsMatch = confirmPassword.trim().length > 0 && password === confirmPassword;
  const passwordReady = password.trim().length > 0 && confirmPassword.trim().length > 0;
  const mobileInvalid = Boolean(mobile.trim()) && !isValidMobilePhone(mobile);
  const mobileRequired = allowEditableMobile || Boolean(embeddedInquiryFlow);
  const otpReady = signupCodeRequested && VERIFICATION_CODE_REGEX.test(verificationCode.trim());
  const formReady =
    firstName.trim().length > 0 &&
    hasAnyIdentity &&
    (mode === "password" ? passwordReady : otpReady) &&
    (!captchaEnabled || captchaValid);
  const showFirstNameError = hasError && !firstName.trim();
  const showMobileRequiredError = hasError && mobileRequired && !mobile.trim();
  const showMobileInvalidError = hasError && Boolean(mobile.trim()) && mobileInvalid;
  const showPasswordRequiredError = hasError && mode === "password" && !password.trim();
  const showConfirmPasswordRequiredError =
    hasError && mode === "password" && !confirmPassword.trim();

  useEffect(() => {
    onSubmittingChange?.(loading);
  }, [loading, onSubmittingChange]);

  const isIdentityFieldRequired = (kind: NonNullable<LoginNavState["identityKind"]>): boolean => {
    if (kind === "mobile" && mobileRequired) {
      return true;
    }
    if (lockedIdentityKind === kind) {
      return true;
    }
    if (mode === "otp") {
      return kind === "mobile";
    }
    return !lockedIdentityKind;
  };

  const updateDigits = (updater: (digits: string[]) => string[]): void => {
    setVerificationDigits((previous) => updater([...previous]));
  };

  const focusDigit = (index: number): void => {
    queueMicrotask(() => {
      inputRefs.current[index]?.focus();
    });
  };

  const handleDigitChange = (index: number, rawValue: string): void => {
    setHasError(false);
    const sanitized = toWesternDigits(rawValue).replace(/\D/g, "");

    if (!sanitized) {
      updateDigits((digits) => {
        digits[index] = "";
        return digits;
      });
      return;
    }

    updateDigits((digits) => {
      let cursor = index;
      for (const digit of sanitized) {
        if (cursor >= VERIFICATION_CODE_LENGTH) {
          break;
        }
        digits[cursor] = digit;
        cursor += 1;
      }
      return digits;
    });

    const nextIndex = Math.min(index + sanitized.length, VERIFICATION_CODE_LENGTH - 1);
    focusDigit(nextIndex);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Backspace") {
      event.preventDefault();
      let previousIndexToFocus: number | null = null;
      updateDigits((digits) => {
        if (digits[index]) {
          digits[index] = "";
          return digits;
        }
        if (index > 0) {
          digits[index - 1] = "";
          previousIndexToFocus = index - 1;
        }
        return digits;
      });
      if (previousIndexToFocus !== null) {
        focusDigit(previousIndexToFocus);
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0 && !event.shiftKey) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowRight" && index < VERIFICATION_CODE_LENGTH - 1 && !event.shiftKey) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault();
    handleDigitChange(index, event.clipboardData.getData("text"));
  };

  const handleRequestSignupCode = async (): Promise<void> => {
    if (!mobile.trim()) {
      setHasError(true);
      showError(t("auth.login.errors.mobileRequiredForOtpSignup"));
      return;
    }

    const normalizedMobile = normalizeAuthIdentityMobileForSubmit(mobile);
    if (!normalizedMobile) {
      setHasError(true);
      showError(t("auth.login.errors.invalidMobile"));
      return;
    }

    const sent = await requestSignupCode(normalizedMobile);
    if (sent) {
      setSignupCodeRequested(true);
      setVerificationDigits([...EMPTY_DIGITS]);
      setHasError(false);
      focusDigit(0);
    }
  };

  const runSubmit = useCallback(async (): Promise<void> => {
    if (!firstName.trim()) {
      setHasError(true);
      showError(t("auth.login.errors.signupFirstNameRequired"));
      return;
    }

    if (mobileRequired && !mobile.trim()) {
      setHasError(true);
      showError(t("auth.login.errors.mobileRequiredForOtpSignup"));
      return;
    }

    if (!hasAnyIdentity) {
      setHasError(true);
      showError(t("auth.login.errors.signupIdentityRequired"));
      return;
    }

    if (email.trim() && !isLatinEmailValue(email)) {
      setHasError(true);
      showError(t("auth.login.errors.invalidEmail"));
      return;
    }

    if (mobile.trim() && !isValidMobilePhone(mobile)) {
      setHasError(true);
      showError(t("auth.login.errors.invalidMobile"));
      return;
    }

    if (username.trim() && !isLatinIdentityUsername(username)) {
      setHasError(true);
      showError(t("auth.login.errors.identityInvalid"));
      return;
    }

    if (username.trim() && !isValidUsernameLength(username)) {
      setHasError(true);
      showError(t("auth.login.errors.usernameMinLength"));
      return;
    }

    if (mode === "password") {
      if (!password.trim()) {
        setHasError(true);
        showError(t("auth.login.errors.passwordRequired"));
        return;
      }

      if (!passwordRulesPassed) {
        setHasError(true);
        showError(t("auth.login.errors.passwordPolicy"));
        return;
      }

      if (!confirmPassword.trim()) {
        setHasError(true);
        showError(t("auth.login.errors.passwordRequired"));
        return;
      }

      if (password !== confirmPassword) {
        setHasError(true);
        showError(t("auth.login.errors.passwordMismatch"));
        return;
      }
    } else {
      if (!mobile.trim()) {
        setHasError(true);
        showError(t("auth.login.errors.mobileRequiredForOtpSignup"));
        return;
      }

      if (!signupCodeRequested) {
        setHasError(true);
        showError(t("auth.login.errors.requestCodeFirst"));
        return;
      }

      if (!VERIFICATION_CODE_REGEX.test(verificationCode.trim())) {
        setHasError(true);
        showError(t("auth.login.errors.invalidVerificationCode"));
        return;
      }
    }

    if (captchaEnabled && !captchaValid) {
      setHasError(true);
      showError(t("auth.login.errors.captchaRequired"));
      return;
    }

    setHasError(false);
    const normalizedMobile = mobile.trim()
      ? normalizeAuthIdentityMobileForSubmit(mobile)
      : undefined;

    if (mobile.trim() && !normalizedMobile) {
      setHasError(true);
      showError(t("auth.login.errors.invalidMobile"));
      return;
    }

    const success = await signup(
      {
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        mobile: normalizedMobile,
        profile: {
          firstName: firstName.trim(),
          ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
        },
        password: mode === "password" ? password : undefined,
        signupCode: mode === "otp" ? verificationCode.trim() : undefined,
        captchaId: captchaEnabled ? captchaId : undefined,
        captchaValue: captchaEnabled ? captchaValue : undefined,
        rememberMe,
      },
      embeddedInquiryFlow
        ? {
            preserveReplacedAnonymousSession: true,
            skipRedirect: true,
            onAccessTokenReceived: async (accessToken) => {
              if (!anonymousAccessToken?.trim()) {
                throw new Error("USER_PRODUCT_INQUIRY_CLAIM_INVALID_ACCESS_TOKEN");
              }

              await claimUserProductInquiryAfterSignup({
                inquiryId: embeddedInquiryFlow.inquiryId,
                accessToken,
                anonymousAccessToken,
              });
            },
          }
        : undefined,
    );

    if (success && embeddedInquiryFlow) {
      embeddedInquiryFlow.onSignupComplete?.();
    }

    if (!success && captchaEnabled) {
      setCaptchaId("");
      setCaptchaValue("");
      setCaptchaValid(false);
      setCaptchaVersion((previous) => previous + 1);
    }
  }, [
    anonymousAccessToken,
    captchaEnabled,
    captchaId,
    captchaValid,
    captchaValue,
    confirmPassword,
    email,
    embeddedInquiryFlow,
    firstName,
    hasAnyIdentity,
    lastName,
    mobile,
    mobileRequired,
    mode,
    password,
    passwordRulesPassed,
    rememberMe,
    showError,
    signup,
    signupCodeRequested,
    t,
    username,
    verificationCode,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        void runSubmit();
      },
    }),
    [runSubmit],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      void runSubmit();
    },
    [runSubmit],
  );

  const handleCaptchaChange = useCallback(
    ({
      captchaId: nextCaptchaId,
      value,
      isValid,
    }: {
      captchaId: string;
      value: string;
      isValid: boolean;
    }): void => {
      setCaptchaId(nextCaptchaId);
      setCaptchaValue(value);
      setCaptchaValid(isValid);
    },
    []
  );

  return (
    <LoginShell embedded={embedded} subtitle={t("auth.login.signupSubtitle")}>
      {hideCredentialHeader ? null : (
        <LoginCredentialHeader identity={identity} onEditIdentity={onEditIdentity} />
      )}

      {supportsOtp ? (
        <ToggleButtonGroup
          exclusive
          value={mode}
          onChange={(_event, nextMode: SignupCredentialMode | null) => {
            if (!nextMode) {
              return;
            }
            setMode(nextMode);
            setHasError(false);
          }}
          className={verifyStyles.methodSwitcher}
          aria-label={t("auth.login.methodSwitcherAria")}
        >
          <ToggleButton value="password" className={verifyStyles.methodButton}>
            <LockIcon fontSize="small" />
            {t("auth.login.passwordMethod")}
          </ToggleButton>
          <ToggleButton value="otp" className={verifyStyles.methodButton}>
            <SmsIcon fontSize="small" />
            {t("auth.login.otpMethod")}
          </ToggleButton>
        </ToggleButtonGroup>
      ) : null}

      <form onSubmit={handleSubmit} className={formStyles.loginForm}>
        {hideFormLead ? null : (
          <Typography component="p" className={formStyles.formLead}>
            {t("auth.login.signupLead")}
          </Typography>
        )}

        <TextField
          fullWidth
          label={t("auth.login.firstNameFieldTitle")}
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          className={formStyles.textField}
          inputProps={persianFieldInputProps}
          disabled={loading}
          required
          error={showFirstNameError}
          helperText={
            showFirstNameError ? t("auth.login.errors.signupFirstNameRequired") : undefined
          }
        />

        <TextField
          fullWidth
          label={t("auth.login.lastNameFieldTitle")}
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          className={formStyles.textField}
          inputProps={persianFieldInputProps}
          disabled={loading}
        />

        <LoginAdornedTextField
          fullWidth
          label={t("auth.login.usernameOptionalFieldTitle")}
          value={username}
          onChange={(event) => setUsername(sanitizeAuthIdentityInput(event.target.value))}
          inputProps={latinFieldInputProps}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon className={formStyles.inputIcon} />
              </InputAdornment>
            ),
          }}
          disabled={loading || lockedIdentityKind === "username"}
          required={isIdentityFieldRequired("username")}
        />

        <LoginAdornedTextField
          fullWidth
          label={t("auth.login.emailOptionalFieldTitle")}
          value={email}
          onChange={(event) => setEmail(sanitizeLatinEmailInput(event.target.value))}
          inputProps={{ ...latinFieldInputProps, inputMode: "email" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AlternateEmailIcon className={formStyles.inputIcon} />
              </InputAdornment>
            ),
          }}
          disabled={loading || lockedIdentityKind === "email"}
          required={isIdentityFieldRequired("email")}
        />

        <LoginAdornedTextField
          fullWidth
          label={t("auth.login.mobileOptionalFieldTitle")}
          value={mobile}
          onChange={(event) => {
            setMobile(sanitizeMobilePhoneInput(event.target.value));
            setHasError(false);
          }}
          inputProps={{ ...latinFieldInputProps, inputMode: "tel" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon className={formStyles.inputIcon} />
              </InputAdornment>
            ),
          }}
          disabled={loading || (lockedIdentityKind === "mobile" && !allowEditableMobile)}
          error={showMobileRequiredError || showMobileInvalidError}
          helperText={
            showMobileRequiredError
              ? t("auth.login.errors.mobileRequiredForOtpSignup")
              : showMobileInvalidError
                ? t("auth.login.errors.invalidMobile")
                : undefined
          }
          required={isIdentityFieldRequired("mobile")}
        />

        {mode === "password" ? (
          <>
            <LoginAdornedTextField
              fullWidth
              label={t("auth.login.passwordFieldTitle")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setHasError(false);
              }}
              endAdornmentOnlyWhenLabelShrunk
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon className={formStyles.inputIcon} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t("auth.login.togglePasswordVisibility")}
                      onClick={() => setShowPassword((previous) => !previous)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoComplete="new-password"
              disabled={loading}
              error={showPasswordRequiredError || (hasError && !passwordRulesPassed)}
              helperText={
                showPasswordRequiredError
                  ? t("auth.login.errors.passwordRequired")
                  : hasError && !passwordRulesPassed
                    ? t("auth.login.errors.passwordPolicy")
                    : undefined
              }
              required
            />

            <LoginAdornedTextField
              fullWidth
              label={t("auth.login.confirmPasswordFieldTitle")}
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setHasError(false);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon className={formStyles.inputIcon} />
                  </InputAdornment>
                ),
              }}
              autoComplete="new-password"
              disabled={loading}
              error={
                showConfirmPasswordRequiredError ||
                (hasError && Boolean(confirmPassword) && !passwordsMatch)
              }
              helperText={
                showConfirmPasswordRequiredError
                  ? t("auth.login.errors.passwordRequired")
                  : confirmPassword && !passwordsMatch
                    ? t("auth.login.errors.passwordMismatch")
                    : undefined
              }
              required
            />
          </>
        ) : (
          <Box className={verifyStyles.verificationCodeContainer}>
            <FormLabel
              required
              component="legend"
              id="signup-otp-section-title"
              className={verifyStyles.verificationCodeSectionTitle}
            >
              {t("auth.login.verificationCodeSectionTitle")}
            </FormLabel>
            <Button
              type="button"
              variant="outlined"
              onClick={handleRequestSignupCode}
              disabled={loading}
              className={verifyStyles.sendCodeButton}
            >
              {loading
                ? t("auth.login.sendingCode")
                : signupCodeRequested
                  ? t("auth.login.resendVerificationCode")
                  : t("auth.login.sendVerificationCode")}
            </Button>

            <Box
              className={verifyStyles.verificationCodeInputs}
              role="group"
              aria-labelledby="signup-otp-section-title"
            >
              {verificationDigits.map((digit, index) => (
                <TextField
                  key={`signup-verification-digit-${index}`}
                  value={digit}
                  onChange={(event) => handleDigitChange(index, event.target.value)}
                  onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(index, event)
                  }
                  onPaste={(event: React.ClipboardEvent<HTMLInputElement>) =>
                    handlePaste(index, event)
                  }
                  inputRef={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  variant="outlined"
                  className={verifyStyles.verificationCodeInput}
                  autoComplete="one-time-code"
                  disabled={loading || !signupCodeRequested}
                  error={hasError}
                  inputProps={{
                    maxLength: 1,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    spellCheck: false,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {captchaEnabled ? (
          <LoginCaptchaField
            key={`signup-captcha-${captchaVersion}`}
            disabled={loading}
            error={hasError}
            required
            onCaptchaChange={handleCaptchaChange}
          />
        ) : null}

        <Box className={verifyStyles.rememberMeContainer}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                color="primary"
              />
            }
            label={t("auth.login.rememberMe")}
            labelPlacement="end"
            className={verifyStyles.rememberMeLabel}
          />
        </Box>

        {hideSubmitButton ? null : (
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            className={formStyles.loginButton}
            disabled={loading || !formReady}
            startIcon={
              loading ? (
                <CircularProgress className={formStyles.loginButtonSpinner} color="inherit" />
              ) : null
            }
          >
            {loading ? t("auth.login.creatingAccount") : t("auth.login.signUp")}
          </Button>
        )}
      </form>
    </LoginShell>
  );
}

export const SignupForm = forwardRef(SignupFormInner);
SignupForm.displayName = "SignupForm";
