import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import { useQuery } from "@apollo/client/react";
import { MenuItem, Stack, TextField } from "@mui/material";

import {
  INQUIRY_STATUS_LABEL,
  INQUIRY_STATUS_OPTIONS,
} from "./inquiries-status.shared";
import type { UserProductInquiryStatus } from "./inquiries-list.api";
import type {
  UserProductInquiryStatusUpdateMutation,
  UserProductInquiryStatusUpdateMutationVariables,
} from "./inquiry-status-update.api";
import {
  type InquiryContactedDetails,
  type InquirySaleCompletedDetails,
  toLocalDateTimeInputValueFromIso,
} from "./inquiry-sale-payload.util";
import {
  formatIntegerWithThousands,
  parseOptionalNumber,
} from "../Products/product-form-dialog/product-form.state.util";
import { USER_PRODUCT_INQUIRY_STATUS_UPDATE_MUTATION } from "../../graphql/mutations/userProductInquiryStatusUpdate.mutation";
import { USER_DETAIL_QUERY } from "../../graphql/queries/userDetail.query";
import { useAuth } from "../../contexts/AuthContext";
import { useMutationWithSnackbar } from "../../hooks/useMutationWithSnackbar";
import { useTranslation } from "../../hooks/useTranslation";
import {
  MULTILINE_TEXTAREA_MAX_ROWS,
  MULTILINE_TEXTAREA_MIN_ROWS,
} from "../../constants/multilineTextarea.constants";
import ActiveSuperAdminPickerField, {
  type ActiveSuperAdminOption,
} from "../../shared/forms/ActiveSuperAdminPickerField";
import {
  buildActiveSuperAdminOptionFromAuthUser,
  userToActiveSuperAdminOption,
} from "../../shared/forms/active-super-admin.util";
import JalaliDateTimeField from "../../shared/table/JalaliDateTimeField";
import type {
  UserDetailQuery,
  UserDetailQueryVariables,
} from "../UsersManagement/users-management-list.api";

const DESCRIPTION_MAX_LENGTH = 2000;

function toLocalDateTimeInputValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function createDefaultDateTimeValue(): string {
  return toLocalDateTimeInputValue(new Date());
}

type StatusEditFormSnapshot = {
  readonly status: UserProductInquiryStatus;
  readonly description: string;
  readonly contactedAt: string;
  readonly contactedById: string | null;
  readonly completedAt: string;
  readonly completedById: string | null;
  readonly finalPriceIrt: string;
};

function buildBaselineSnapshot(params: {
  readonly initialStatus: UserProductInquiryStatus;
  readonly initialContacted: InquiryContactedDetails | null;
  readonly initialSaleCompleted: InquirySaleCompletedDetails | null;
}): StatusEditFormSnapshot {
  return {
    status: params.initialStatus,
    description: "",
    contactedAt:
      params.initialStatus === "CONTACTED" && params.initialContacted
        ? toLocalDateTimeInputValueFromIso(params.initialContacted.contactedAt)
        : "",
    contactedById:
      params.initialStatus === "CONTACTED" && params.initialContacted?.contactedBy
        ? params.initialContacted.contactedBy
        : null,
    completedAt:
      params.initialStatus === "SALE_COMPLETED" && params.initialSaleCompleted
        ? toLocalDateTimeInputValueFromIso(params.initialSaleCompleted.completedAt)
        : "",
    completedById:
      params.initialStatus === "SALE_COMPLETED" && params.initialSaleCompleted?.completedBy
        ? params.initialSaleCompleted.completedBy
        : null,
    finalPriceIrt:
      params.initialStatus === "SALE_COMPLETED" && params.initialSaleCompleted
        ? formatIntegerWithThousands(String(params.initialSaleCompleted.finalPriceIrt))
        : "",
  };
}

function areSnapshotsEqual(
  left: StatusEditFormSnapshot,
  right: StatusEditFormSnapshot,
): boolean {
  return (
    left.status === right.status &&
    left.description === right.description &&
    left.contactedAt === right.contactedAt &&
    left.contactedById === right.contactedById &&
    left.completedAt === right.completedAt &&
    left.completedById === right.completedById &&
    left.finalPriceIrt === right.finalPriceIrt
  );
}

export type InquiryStatusEditSectionHandle = {
  submit: () => void;
};

type InquiryStatusEditSectionProps = {
  readonly inquiryId: string;
  readonly initialStatus: UserProductInquiryStatus;
  readonly initialContacted?: InquiryContactedDetails | null;
  readonly initialSaleCompleted?: InquirySaleCompletedDetails | null;
  readonly onSuccess?: () => void;
  readonly onSubmittingChange?: (submitting: boolean) => void;
  readonly onCanSubmitChange?: (canSubmit: boolean) => void;
};

const InquiryStatusEditSection = forwardRef<
  InquiryStatusEditSectionHandle,
  InquiryStatusEditSectionProps
>(function InquiryStatusEditSection(
  {
    inquiryId,
    initialStatus,
    initialContacted = null,
    initialSaleCompleted = null,
    onSuccess,
    onSubmittingChange,
    onCanSubmitChange,
  },
  ref,
): ReactElement {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [status, setStatus] = useState<UserProductInquiryStatus>(initialStatus);
  const [description, setDescription] = useState("");
  const [contactedAt, setContactedAt] = useState("");
  const [contactedBy, setContactedBy] = useState<ActiveSuperAdminOption | null>(null);
  const [completedAt, setCompletedAt] = useState("");
  const [completedBy, setCompletedBy] = useState<ActiveSuperAdminOption | null>(null);
  const [finalPriceIrt, setFinalPriceIrt] = useState("");

  const defaultSuperAdmin = useMemo((): ActiveSuperAdminOption | null => {
    if (!user) {
      return null;
    }

    return buildActiveSuperAdminOptionFromAuthUser(user);
  }, [user]);

  const resetContactedDetails = useCallback((): void => {
    if (initialStatus === "CONTACTED" && initialContacted) {
      setContactedAt(toLocalDateTimeInputValueFromIso(initialContacted.contactedAt));
      setContactedBy(null);
      return;
    }

    setContactedAt(createDefaultDateTimeValue());
    setContactedBy(defaultSuperAdmin);
  }, [defaultSuperAdmin, initialContacted, initialStatus]);

  const resetSaleCompletedDetails = useCallback((): void => {
    if (initialStatus === "SALE_COMPLETED" && initialSaleCompleted) {
      setCompletedAt(toLocalDateTimeInputValueFromIso(initialSaleCompleted.completedAt));
      setCompletedBy(null);
      setFinalPriceIrt(
        formatIntegerWithThousands(String(initialSaleCompleted.finalPriceIrt)),
      );
      return;
    }

    setCompletedAt(createDefaultDateTimeValue());
    setCompletedBy(defaultSuperAdmin);
    setFinalPriceIrt("");
  }, [defaultSuperAdmin, initialSaleCompleted, initialStatus]);

  const { data: initialCompletedByUserData } = useQuery<
    UserDetailQuery,
    UserDetailQueryVariables
  >(USER_DETAIL_QUERY, {
    variables: { input: { id: initialSaleCompleted?.completedBy ?? "" } },
    skip: initialStatus !== "SALE_COMPLETED" || !initialSaleCompleted?.completedBy,
    fetchPolicy: "cache-first",
  });

  const { data: initialContactedByUserData } = useQuery<
    UserDetailQuery,
    UserDetailQueryVariables
  >(USER_DETAIL_QUERY, {
    variables: { input: { id: initialContacted?.contactedBy ?? "" } },
    skip: initialStatus !== "CONTACTED" || !initialContacted?.contactedBy,
    fetchPolicy: "cache-first",
  });

  const baselineSnapshot = useMemo(
    () =>
      buildBaselineSnapshot({
        initialStatus,
        initialContacted,
        initialSaleCompleted,
      }),
    [initialContacted, initialSaleCompleted, initialStatus, inquiryId],
  );

  useEffect(() => {
    setStatus(initialStatus);
    setDescription("");
    setContactedAt("");
    setContactedBy(null);
    setCompletedAt("");
    setCompletedBy(null);
    setFinalPriceIrt("");

    if (initialStatus === "CONTACTED" && initialContacted) {
      setContactedAt(toLocalDateTimeInputValueFromIso(initialContacted.contactedAt));
    }

    if (initialStatus === "SALE_COMPLETED" && initialSaleCompleted) {
      setCompletedAt(toLocalDateTimeInputValueFromIso(initialSaleCompleted.completedAt));
      setFinalPriceIrt(
        formatIntegerWithThousands(String(initialSaleCompleted.finalPriceIrt)),
      );
    }
  }, [initialContacted, initialSaleCompleted, initialStatus, inquiryId]);

  useEffect(() => {
    const userDetail = initialContactedByUserData?.userDetail;

    if (!userDetail || initialStatus !== "CONTACTED") {
      return;
    }

    setContactedBy(userToActiveSuperAdminOption(userDetail));
  }, [initialContactedByUserData, initialStatus]);

  useEffect(() => {
    const userDetail = initialCompletedByUserData?.userDetail;

    if (!userDetail || initialStatus !== "SALE_COMPLETED") {
      return;
    }

    setCompletedBy(userToActiveSuperAdminOption(userDetail));
  }, [initialCompletedByUserData, initialStatus]);

  useEffect(() => {
    if (status !== "CONTACTED") {
      setContactedAt("");
      setContactedBy(null);
      return;
    }

    if (initialStatus === "CONTACTED" && initialContacted) {
      if (!contactedAt) {
        setContactedAt(toLocalDateTimeInputValueFromIso(initialContacted.contactedAt));
      }

      if (!contactedBy && initialContactedByUserData?.userDetail) {
        setContactedBy(userToActiveSuperAdminOption(initialContactedByUserData.userDetail));
      }

      return;
    }

    if (!contactedAt) {
      setContactedAt(createDefaultDateTimeValue());
    }

    if (!contactedBy && defaultSuperAdmin) {
      setContactedBy(defaultSuperAdmin);
    }
  }, [
    contactedAt,
    contactedBy,
    defaultSuperAdmin,
    initialContacted,
    initialContactedByUserData,
    initialStatus,
    status,
  ]);

  useEffect(() => {
    if (status !== "SALE_COMPLETED") {
      setCompletedAt("");
      setCompletedBy(null);
      setFinalPriceIrt("");
      return;
    }

    if (initialStatus === "SALE_COMPLETED" && initialSaleCompleted) {
      if (!completedAt) {
        setCompletedAt(toLocalDateTimeInputValueFromIso(initialSaleCompleted.completedAt));
      }

      if (!completedBy && initialCompletedByUserData?.userDetail) {
        setCompletedBy(userToActiveSuperAdminOption(initialCompletedByUserData.userDetail));
      }

      if (!finalPriceIrt.trim()) {
        setFinalPriceIrt(
          formatIntegerWithThousands(String(initialSaleCompleted.finalPriceIrt)),
        );
      }

      return;
    }

    if (!completedAt) {
      setCompletedAt(createDefaultDateTimeValue());
    }

    if (!completedBy && defaultSuperAdmin) {
      setCompletedBy(defaultSuperAdmin);
    }
  }, [
    completedAt,
    completedBy,
    defaultSuperAdmin,
    finalPriceIrt,
    initialCompletedByUserData,
    initialSaleCompleted,
    initialStatus,
    status,
  ]);

  const [updateStatus, updateStatusResult] = useMutationWithSnackbar<
    UserProductInquiryStatusUpdateMutation,
    UserProductInquiryStatusUpdateMutationVariables
  >(USER_PRODUCT_INQUIRY_STATUS_UPDATE_MUTATION, {
    successMessage: t("pages.inquiries.statusEdit.success"),
    errorMessage: t("pages.inquiries.statusEdit.error"),
    onSuccess: () => {
      setDescription("");
      if (status === "CONTACTED") {
        resetContactedDetails();
      }
      if (status === "SALE_COMPLETED") {
        resetSaleCompletedDetails();
      }
      onSuccess?.();
    },
  });

  const submitting = updateStatusResult.loading;
  const isContactedStatus = status === "CONTACTED";
  const isSaleCompletedStatus = status === "SALE_COMPLETED";
  const trimmedDescription = description.trim();
  const contactedAtDate = contactedAt.trim() ? new Date(contactedAt) : null;
  const completedAtDate = completedAt.trim() ? new Date(completedAt) : null;
  const hasValidContactedAt =
    contactedAtDate != null && !Number.isNaN(contactedAtDate.getTime());
  const hasValidCompletedAt =
    completedAtDate != null && !Number.isNaN(completedAtDate.getTime());
  const parsedFinalPriceIrt = parseOptionalNumber(finalPriceIrt) ?? null;
  const hasValidFinalPriceIrt =
    parsedFinalPriceIrt != null &&
    !Number.isNaN(parsedFinalPriceIrt) &&
    parsedFinalPriceIrt >= 0;
  const isFormValid =
    !submitting &&
    (!isContactedStatus || (hasValidContactedAt && contactedBy != null)) &&
    (!isSaleCompletedStatus ||
      (hasValidCompletedAt && completedBy != null && hasValidFinalPriceIrt));
  const currentSnapshot = useMemo(
    (): StatusEditFormSnapshot => ({
      status,
      description: trimmedDescription,
      contactedAt: isContactedStatus ? contactedAt.trim() : "",
      contactedById: isContactedStatus ? (contactedBy?.id ?? null) : null,
      completedAt: isSaleCompletedStatus ? completedAt.trim() : "",
      completedById: isSaleCompletedStatus ? (completedBy?.id ?? null) : null,
      finalPriceIrt: isSaleCompletedStatus ? finalPriceIrt.trim() : "",
    }),
    [
      completedAt,
      completedBy,
      contactedAt,
      contactedBy,
      finalPriceIrt,
      isContactedStatus,
      isSaleCompletedStatus,
      status,
      trimmedDescription,
    ],
  );
  const hasChanges = !areSnapshotsEqual(currentSnapshot, baselineSnapshot);
  const canSubmit = isFormValid && hasChanges;

  useEffect(() => {
    onSubmittingChange?.(submitting);
  }, [onSubmittingChange, submitting]);

  useEffect(() => {
    onCanSubmitChange?.(canSubmit);
  }, [canSubmit, onCanSubmitChange]);

  const handleSubmit = useCallback((): void => {
    if (!canSubmit) {
      return;
    }

    void updateStatus({
      variables: {
        input: {
          id: inquiryId,
          status,
          description: trimmedDescription || null,
          ...(isContactedStatus && contactedBy && hasValidContactedAt
            ? {
              contacted: {
                contactedAt: contactedAtDate!.toISOString(),
                contactedBy: contactedBy.id,
              },
            }
            : {}),
          ...(isSaleCompletedStatus &&
          completedBy &&
          hasValidCompletedAt &&
          hasValidFinalPriceIrt
            ? {
              saleCompleted: {
                completedAt: completedAtDate!.toISOString(),
                completedBy: completedBy.id,
                finalPriceIrt: parsedFinalPriceIrt!,
              },
            }
            : {}),
        },
      },
    });
  }, [
    canSubmit,
    completedAtDate,
    completedBy,
    contactedAtDate,
    contactedBy,
    finalPriceIrt,
    hasValidCompletedAt,
    hasValidContactedAt,
    hasValidFinalPriceIrt,
    inquiryId,
    isContactedStatus,
    isSaleCompletedStatus,
    parsedFinalPriceIrt,
    status,
    trimmedDescription,
    updateStatus,
  ]);

  useImperativeHandle(ref, () => ({ submit: handleSubmit }), [handleSubmit]);

  return (
    <Stack spacing={2}>
      <TextField
        select
        fullWidth
        size="small"
        label={t("table.pages.inquiries.columns.status")}
        value={status}
        disabled={submitting}
        onChange={(event) => setStatus(event.target.value as UserProductInquiryStatus)}
      >
        {INQUIRY_STATUS_OPTIONS.map((option) => (
          <MenuItem key={option} value={option}>
            {INQUIRY_STATUS_LABEL[option]}
          </MenuItem>
        ))}
      </TextField>

      {isContactedStatus ? (
        <>
          <JalaliDateTimeField
            label={t("pages.inquiries.statusEdit.contactedAtLabel")}
            ariaLabel={t("pages.inquiries.statusEdit.contactedAtLabel")}
            value={contactedAt}
            required
            onChange={setContactedAt}
          />
          <ActiveSuperAdminPickerField
            value={contactedBy}
            onChange={setContactedBy}
            enabled={!submitting}
            required
            disabled={submitting}
            label={t("pages.inquiries.statusEdit.contactedByLabel")}
          />
        </>
      ) : null}

      {isSaleCompletedStatus ? (
        <>
          <JalaliDateTimeField
            label={t("pages.inquiries.statusEdit.completedAtLabel")}
            ariaLabel={t("pages.inquiries.statusEdit.completedAtLabel")}
            value={completedAt}
            required
            onChange={setCompletedAt}
          />
          <ActiveSuperAdminPickerField
            value={completedBy}
            onChange={setCompletedBy}
            enabled={!submitting}
            required
            disabled={submitting}
            label={t("pages.inquiries.statusEdit.completedByLabel")}
          />
          <TextField
            fullWidth
            size="small"
            required
            label={t("pages.inquiries.statusEdit.finalPriceIrtLabel")}
            value={finalPriceIrt}
            disabled={submitting}
            inputProps={{ inputMode: "numeric" }}
            onChange={(event) =>
              setFinalPriceIrt(formatIntegerWithThousands(event.target.value))
            }
          />
        </>
      ) : null}

      <TextField
        fullWidth
        multiline
        minRows={MULTILINE_TEXTAREA_MIN_ROWS}
        maxRows={MULTILINE_TEXTAREA_MAX_ROWS}
        label={t("pages.inquiries.statusEdit.descriptionLabel")}
        value={description}
        disabled={submitting}
        inputProps={{ maxLength: DESCRIPTION_MAX_LENGTH }}
        placeholder={t("pages.inquiries.statusEdit.descriptionPlaceholder")}
        onChange={(event) => setDescription(event.target.value)}
      />
    </Stack>
  );
});

export default InquiryStatusEditSection;
