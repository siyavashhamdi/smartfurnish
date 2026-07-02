import {
  type FormEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { useScrollContainerToTopOnOpen } from "../../hooks/useScrollContainerToTopOnOpen";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
  type Breakpoint,
} from "@mui/material";
import { useMobileDialogProps } from "../../hooks/useMobileDialogProps";
import { EntityModalCloseProvider } from "./entityModalCloseContext";
import { crudModalFooterSx, crudModalTitleSx } from "./modalThemeSx";
import UnsavedFormChangesDialog from "./UnsavedFormChangesDialog";
import styles from "./styles/EntityModalShell.module.scss";

export interface EntityModalShellProps {
  open: boolean;
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: Breakpoint;
  fullWidth?: boolean;
  useFormWrapper?: boolean;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  pinFooterToBottomOnMobile?: boolean;
  /** When false, a successful save should not call onClose automatically. */
  closeOnSave?: boolean;
  /** Re-run scroll reset when dialog content identity changes (e.g. loaded edit record). */
  resetKey?: unknown;
  disableAutoFocus?: boolean;
  disableRestoreFocus?: boolean;
  /** Keep scrollbars visible on mobile (overrides global hide). */
  showVisibleScrollbar?: boolean;
  /** When true, closing is blocked (e.g. while saving). */
  disableClose?: boolean;
  /**
   * When true, user must confirm before the modal closes (backdrop, escape, close button).
   * Pass the same condition that enables the save/submit action.
   */
  hasUnsavedChanges?: boolean;
  /** Extra space between the title block and form content (e.g. create dialogs). */
  relaxedHeaderSpacing?: boolean;
  /** Keep a floating dialog on compact viewports instead of edge-to-edge maximized layout. */
  disableMobileMaximize?: boolean;
  /** Hide the dialog title block (e.g. compact contact forms). */
  hideTitle?: boolean;
  /** Optional content rendered below the title/subtitle in the header. */
  headerAccessory?: ReactNode;
  titleClassName?: string;
  contentClassName?: string;
  /** Optional ref to the scrollable dialog content container. */
  dialogContentRef?: Ref<HTMLDivElement>;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  ref.current = value;
}

const EntityModalShell = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidth = "sm",
  fullWidth = true,
  useFormWrapper = false,
  onSubmit,
  pinFooterToBottomOnMobile = true,
  resetKey,
  disableAutoFocus,
  disableRestoreFocus,
  showVisibleScrollbar = false,
  disableClose = false,
  hasUnsavedChanges = false,
  relaxedHeaderSpacing = false,
  disableMobileMaximize = false,
  hideTitle = false,
  headerAccessory,
  titleClassName,
  contentClassName,
  dialogContentRef,
}: EntityModalShellProps): ReactElement => {
  const theme = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const { isCompact, useMaximizedMobileLayout, dialogProps, getPaperProps, getContentProps } =
    useMobileDialogProps({ disableMobileMaximize });
  const { onEntered } = useScrollContainerToTopOnOpen(open, contentRef, resetKey);

  const handleContentRef = useCallback(
    (node: HTMLDivElement | null): void => {
      contentRef.current = node;
      assignRef(dialogContentRef, node);
    },
    [dialogContentRef]
  );

  const handleDialogEnter = useCallback((): void => {
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      active !== document.body &&
      !active.closest('[role="dialog"]')
    ) {
      active.blur();
    }
  }, []);

  const requestClose = useCallback((): void => {
    if (disableClose) {
      return;
    }

    if (hasUnsavedChanges) {
      setDiscardConfirmOpen(true);
      return;
    }

    onClose();
  }, [disableClose, hasUnsavedChanges, onClose]);

  const handleDialogClose = useCallback(
    (_event: object, reason: "backdropClick" | "escapeKeyDown"): void => {
      if (reason === "backdropClick" || reason === "escapeKeyDown") {
        requestClose();
      }
    },
    [requestClose]
  );

  const handleConfirmDiscard = useCallback((): void => {
    setDiscardConfirmOpen(false);
    onClose();
  }, [onClose]);

  const handleStayOnForm = useCallback((): void => {
    setDiscardConfirmOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      setDiscardConfirmOpen(false);
    }
  }, [open]);

  const dialogContentClassName = [
    styles.modalDialogContent,
    isCompact ? styles.modalDialogContentScrollMobile : styles.modalDialogContentScrollDesktop,
    showVisibleScrollbar ? styles.modalDialogContentVisibleScrollbar : undefined,
    relaxedHeaderSpacing ? styles.modalDialogContentRelaxed : undefined,
    contentClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const renderHeader = (): ReactElement => (
    <DialogTitle
      className={[
        styles.modalDialogTitle,
        relaxedHeaderSpacing ? styles.modalDialogTitleRelaxed : undefined,
        titleClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      sx={crudModalTitleSx(theme)}
    >
      <Stack spacing={subtitle || headerAccessory ? 0.75 : 0} sx={{ flex: 1, minWidth: 0, width: "100%" }}>
        <Typography variant="h6" component="div" className={styles.modalTitleTypography}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body2"
            color="text.secondary"
            component="div"
            className={styles.modalSubtitleTypography}
          >
            {subtitle}
          </Typography>
        ) : null}
        {headerAccessory}
      </Stack>
    </DialogTitle>
  );

  const renderContent = (): ReactElement => (
    <DialogContent ref={handleContentRef} {...getContentProps({ className: dialogContentClassName })}>
      {children}
    </DialogContent>
  );

  const renderFooter = (): ReactElement | null =>
    footer != null ? (
      <Box component="footer" sx={crudModalFooterSx(theme, { pinFooterToBottomOnMobile })}>
        {footer}
      </Box>
    ) : null;

  const renderedBody = (
    <>
      {hideTitle ? null : renderHeader()}
      {renderContent()}
      {renderFooter()}
    </>
  );

  return (
    <>
      <EntityModalCloseProvider value={requestClose}>
        <Dialog
          open={open}
          onClose={handleDialogClose}
          maxWidth={maxWidth}
          disableAutoFocus={disableAutoFocus}
          disableRestoreFocus={disableRestoreFocus}
          {...dialogProps}
          fullWidth={fullWidth}
          TransitionProps={{ onEnter: handleDialogEnter, onEntered }}
          PaperProps={getPaperProps({
            className: useMaximizedMobileLayout ? styles.modalPaperMobileFlex : undefined,
          })}
        >
          {useFormWrapper ? (
            <Box
              component="form"
              onSubmit={onSubmit}
              className={useMaximizedMobileLayout ? styles.modalFormRootMobile : undefined}
            >
              {renderedBody}
            </Box>
          ) : (
            renderedBody
          )}
        </Dialog>
      </EntityModalCloseProvider>

      <UnsavedFormChangesDialog
        open={discardConfirmOpen}
        onStay={handleStayOnForm}
        onDiscard={handleConfirmDiscard}
      />
    </>
  );
};

export default EntityModalShell;
