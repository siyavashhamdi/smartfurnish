import type { AlertColor } from "@mui/material/Alert";
import { alpha, createTheme, type SxProps, type Theme } from "@mui/material/styles";

type PaletteMode = "light" | "dark";

/** Gold primary + forest secondary — premium brass CTAs in both modes. */
const lightColors = {
  primary: {
    main: "#c9a66b",
    light: "#e8d3ae",
    dark: "#9a7848",
    contrastText: "#1a2e1f",
  },
  secondary: {
    main: "#1a2e1f",
    light: "#2a4530",
    dark: "#0f1a12",
    contrastText: "#faf8f5",
  },
  success: {
    main: "#2f6b4f",
    light: "#4a8a6a",
    dark: "#1f4d38",
  },
  warning: {
    main: "#c4842e",
    light: "#e8a54b",
    dark: "#9a6620",
  },
  error: {
    main: "#c43c3c",
    light: "#e05c5c",
    dark: "#9a2828",
  },
  info: {
    main: "#2a4530",
    light: "#4a6b52",
    dark: "#1a2e1f",
  },
  grey: {
    50: "#faf8f5",
    100: "#f0ebe3",
    200: "#e0d9cf",
    300: "#c9c0b4",
    400: "#9a9288",
    500: "#5c5c5c",
    600: "#454540",
    700: "#333330",
    800: "#222220",
    900: "#171717",
  },
} as const;

const darkColors = {
  primary: {
    main: "#d9c39a",
    light: "#f0ddb8",
    dark: "#c9a66b",
    contrastText: "#0b100c",
  },
  secondary: {
    main: "#2a4530",
    light: "#4a6b52",
    dark: "#1a2e1f",
    contrastText: "#f5f1eb",
  },
  success: {
    main: "#7fbf98",
    light: "#9dd4b0",
    dark: "#5a9a72",
  },
  warning: {
    main: "#e8a54b",
    light: "#f0c078",
    dark: "#c4842e",
  },
  error: {
    main: "#ef4444",
    light: "#f87171",
    dark: "#dc2626",
  },
  info: {
    main: "#8fae95",
    light: "#afc9b4",
    dark: "#6b8a72",
  },
  grey: {
    50: "#f5f1eb",
    100: "#e8e4dc",
    200: "#d0ccc4",
    300: "#b0b0aa",
    400: "#8a8a84",
    500: "#6a6a64",
    600: "#4a4a46",
    700: "#333330",
    800: "#222220",
    900: "#141a15",
  },
} as const;

const FONT_FAMILY_STACK = [
  "B Yekan",
  "-apple-system",
  "BlinkMacSystemFont",
  "Arial",
  "sans-serif",
].join(",");

const lightShadows = {
  sm: "0 0.0625rem 0.125rem 0 rgba(154, 120, 72, 0.08)",
  md: "0 0.125rem 0.5rem rgba(154, 120, 72, 0.12)",
  lg: "0 0.25rem 1rem rgba(154, 120, 72, 0.16)",
  xl: "0 0.625rem 1.5rem rgba(154, 120, 72, 0.2)",
} as const;

const darkShadows = {
  sm: "0 0.0625rem 0.125rem 0 rgba(0, 0, 0, 0.3)",
  md: "0 0.125rem 0.5rem rgba(0, 0, 0, 0.4)",
  lg: "0 0.25rem 1rem rgba(0, 0, 0, 0.5)",
  xl: "0 0.625rem 1.5rem rgba(0, 0, 0, 0.6)",
} as const;

const transparentInputChrome = {
  backgroundColor: "transparent",
  background: "none",
  backgroundImage: "none",
} as const;

/** Default single-line TextField height (product edit dialog reference). */
const INPUT_MIN_HEIGHT = "3.4375rem";

/** Entity table filters/search — MUI size="small" before global form height (theme @ 234df52^). */
const TABLE_SHELL_SCOPE = ".entity-table-shell";
const TABLE_INPUT_MIN_HEIGHT = "2.5rem";
const TABLE_INPUT_PADDING_BLOCK = "8.5px";

export const createAppTheme = (mode: PaletteMode): Theme => {
  const isDark = mode === "dark";
  const colors = isDark ? darkColors : lightColors;
  const shadows = isDark ? darkShadows : lightShadows;
  const borderRadius = 8;
  const buttonRadius = "0.625rem";
  const cardRadius = "0.75rem";
  const inputRadius = "0.5rem";
  const chipRadius = "0.5rem";
  const listItemRadius = "0.5rem";
  const contentSurfaceBg = {
    backgroundColor: "var(--app-content-surface-bg, var(--app-surface-bg))",
    backgroundImage: isDark ? "none" : "var(--app-content-surface-gradient)",
  } as const;
  const panelSurfaceBg = {
    backgroundColor: "var(--app-content-surface-bg, var(--app-surface-bg))",
    backgroundImage: isDark ? "none" : "var(--app-panel-gradient)",
  } as const;

  return createTheme({
    palette: {
      mode,
      primary: colors.primary,
      secondary: colors.secondary,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      info: colors.info,
      background: {
        default: isDark ? "#0b100c" : "#faf8f5",
        paper: isDark ? "#141a15" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f5f1eb" : "#171717",
        secondary: isDark ? "#b0b0aa" : "#5c5c5c",
        disabled: colors.grey[400],
      },
      divider: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(23, 23, 23, 0.08)",
      grey: colors.grey,
    },
    direction: "rtl",
    typography: {
      fontFamily: FONT_FAMILY_STACK,
      h1: {
        fontWeight: 700,
        fontSize: "2.5rem",
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontWeight: 700,
        fontSize: "2rem",
        lineHeight: 1.3,
        letterSpacing: "-0.01em",
      },
      h3: {
        fontWeight: 600,
        fontSize: "1.75rem",
        lineHeight: 1.4,
      },
      h4: {
        fontWeight: 600,
        fontSize: "1.5rem",
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.25rem",
        lineHeight: 1.5,
      },
      h6: {
        fontWeight: 600,
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: "1rem",
        lineHeight: 1.5,
        fontWeight: 500,
      },
      subtitle2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
        fontWeight: 500,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.6,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
        letterSpacing: 0,
      },
      caption: {
        fontSize: "0.75rem",
        lineHeight: 1.4,
      },
      overline: {
        fontSize: "0.75rem",
        lineHeight: 1.4,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: isDark ? darkColors.primary.light : lightColors.primary.dark,
      },
    },
    shape: {
      borderRadius,
    },
    spacing: 8,
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    zIndex: {
      mobileStepper: 1000,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
        easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundAttachment: "fixed",
          },
          "::selection": {
            backgroundColor: isDark ? "rgba(201, 166, 107, 0.25)" : "rgba(201, 166, 107, 0.35)",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: buttonRadius,
            padding: "0.625rem 1.5rem",
            fontWeight: 600,
            textTransform: "none",
            transition: "transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease",
            gap: "0.5rem",
            "& .MuiButton-startIcon, & .MuiButton-endIcon": {
              margin: 0,
              color: "inherit",
              opacity: 1,
            },
            "& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)": {
              fontSize: "1.125rem",
            },
            "&:active": {
              transform: "scale(0.98)",
            },
          },
          contained: {
            boxShadow: isDark
              ? "0 4px 14px rgba(201, 166, 107, 0.22)"
              : "0 4px 14px rgba(201, 166, 107, 0.28)",
            "&:hover": {
              boxShadow: isDark
                ? "0 6px 20px rgba(201, 166, 107, 0.3)"
                : "0 6px 20px rgba(201, 166, 107, 0.36)",
            },
          },
          containedPrimary: {
            color: colors.primary.contrastText,
            background: isDark
              ? `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 50%, ${colors.primary.light} 100%)`
              : `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 48%, ${colors.primary.light} 100%)`,
            "&:hover": {
              color: colors.primary.contrastText,
              background: isDark
                ? `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`
                : `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
            },
            "&.Mui-disabled": {
              color: alpha(colors.primary.contrastText, 0.45),
              background: alpha(colors.primary.main, 0.35),
            },
          },
          containedSecondary: {
            color: colors.secondary.contrastText,
            "&:hover": {
              color: colors.secondary.contrastText,
            },
          },
          containedSuccess: {
            color: "#ffffff",
            "&:hover": {
              color: "#ffffff",
            },
          },
          containedError: {
            color: "#ffffff",
            "&:hover": {
              color: "#ffffff",
            },
          },
          containedWarning: {
            color: isDark ? "#0b100c" : "#ffffff",
            "&:hover": {
              color: isDark ? "#0b100c" : "#ffffff",
            },
          },
          outlined: {
            borderWidth: "1.5px",
            "&:hover": {
              borderWidth: "1.5px",
            },
          },
          outlinedPrimary: {
            color: colors.primary.main,
            borderColor: alpha(colors.primary.main, isDark ? 0.45 : 0.38),
            "&:hover": {
              color: isDark ? colors.primary.light : colors.primary.dark,
              borderColor: alpha(colors.primary.main, isDark ? 0.62 : 0.55),
              backgroundColor: alpha(colors.primary.main, isDark ? 0.12 : 0.06),
            },
          },
          outlinedSecondary: {
            color: isDark ? colors.secondary.light : colors.secondary.main,
            borderColor: alpha(colors.secondary.main, isDark ? 0.4 : 0.35),
            "&:hover": {
              color: isDark ? colors.secondary.contrastText : colors.secondary.dark,
              backgroundColor: alpha(colors.secondary.main, isDark ? 0.14 : 0.08),
            },
          },
          text: {
            "&:hover": {
              backgroundColor: alpha(colors.primary.main, isDark ? 0.1 : 0.06),
            },
          },
          textPrimary: {
            color: colors.primary.main,
            "&:hover": {
              color: isDark ? colors.primary.light : colors.primary.dark,
            },
          },
          sizeLarge: {
            paddingInline: "1.75rem",
            paddingBlock: "0.8125rem",
            fontSize: "0.95rem",
          },
          sizeSmall: {
            padding: "0.375rem 1rem",
            fontSize: "0.875rem",
            "& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)": {
              fontSize: "1rem",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: "0.625rem",
            color: isDark ? colors.primary.light : colors.primary.dark,
            transition:
              "color 180ms ease, background-color 180ms ease, transform 180ms ease, border-color 180ms ease",
            "& .MuiSvgIcon-root": {
              fontSize: "1.25rem",
              opacity: 1,
            },
            "&:hover": {
              color: isDark ? colors.primary.main : colors.primary.main,
              backgroundColor: alpha(colors.primary.main, isDark ? 0.16 : 0.1),
            },
            "&:active": {
              transform: "scale(0.96)",
            },
          },
          colorPrimary: {
            color: colors.primary.main,
            "&:hover": {
              color: isDark ? colors.primary.light : colors.primary.dark,
              backgroundColor: alpha(colors.primary.main, isDark ? 0.16 : 0.1),
            },
          },
          colorSecondary: {
            color: isDark ? colors.secondary.light : colors.secondary.main,
            "&:hover": {
              color: isDark ? colors.secondary.contrastText : colors.secondary.dark,
              backgroundColor: alpha(colors.secondary.main, 0.12),
            },
          },
          colorInherit: {
            color: isDark ? alpha("#f5f1eb", 0.88) : alpha("#171717", 0.78),
          },
          colorError: {
            color: colors.error.main,
            "&:hover": {
              backgroundColor: alpha(colors.error.main, 0.12),
            },
          },
          sizeSmall: {
            "& .MuiSvgIcon-root": {
              fontSize: "1.125rem",
            },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            color: isDark ? alpha(colors.primary.light, 0.92) : alpha(colors.primary.dark, 0.88),
          },
          colorPrimary: {
            color: colors.primary.main,
          },
          colorSecondary: {
            color: isDark ? colors.secondary.light : colors.secondary.main,
          },
          colorAction: {
            color: isDark ? alpha("#f5f1eb", 0.78) : alpha("#171717", 0.62),
          },
          colorDisabled: {
            color: colors.grey[400],
          },
          fontSizeSmall: {
            fontSize: "1.125rem",
          },
          fontSizeMedium: {
            fontSize: "1.25rem",
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: isDark ? colors.primary.light : colors.primary.dark,
            minWidth: "2.5rem",
            "& .MuiSvgIcon-root": {
              opacity: 1,
            },
          },
        },
      },
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            color: isDark ? alpha("#f5f1eb", 0.78) : colors.grey[600],
            "&:hover": {
              backgroundColor: alpha(colors.primary.main, isDark ? 0.14 : 0.1),
              color: isDark ? colors.primary.light : colors.primary.dark,
            },
            "&.Mui-selected": {
              color: colors.primary.contrastText,
              backgroundColor: colors.primary.main,
              backgroundImage: isDark
                ? `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 50%, ${colors.primary.light} 100%)`
                : `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 48%, ${colors.primary.light} 100%)`,
              "&:hover": {
                color: colors.primary.contrastText,
                backgroundColor: colors.primary.dark,
              },
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            color: isDark ? alpha("#f5f1eb", 0.72) : colors.grey[600],
            borderColor: alpha(colors.primary.main, isDark ? 0.22 : 0.18),
            "&.Mui-selected": {
              color: colors.primary.contrastText,
              backgroundColor: colors.primary.main,
              borderColor: colors.primary.main,
              "&:hover": {
                backgroundColor: colors.primary.dark,
              },
            },
            "&:hover": {
              backgroundColor: alpha(colors.primary.main, isDark ? 0.1 : 0.06),
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: shadows.md,
            borderRadius: cardRadius,
            transition: "box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out",
            "&:hover": {
              boxShadow: shadows.lg,
              transform: "translateY(-0.125rem)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: cardRadius,
            "&:not(.MuiAlert-root)": {
              ...contentSurfaceBg,
            },
          },
          outlined: {
            ...contentSurfaceBg,
          },
          elevation1: {
            boxShadow: shadows.md,
          },
          elevation2: {
            boxShadow: shadows.lg,
          },
          elevation3: {
            boxShadow: shadows.xl,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          root: {
            "& .MuiBackdrop-root": {
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(11, 16, 12, 0.72)",
            },
          },
          paper: {
            ...contentSurfaceBg,
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.06)"
              : "1px solid rgba(23, 23, 23, 0.06)",
            boxShadow: isDark
              ? "0 1px 2px rgba(0, 0, 0, 0.2), 0 12px 40px rgba(0, 0, 0, 0.25)"
              : "0 1px 2px rgba(26, 46, 31, 0.04), 0 12px 40px rgba(26, 46, 31, 0.06)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            ...contentSurfaceBg,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            ...contentSurfaceBg,
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          inputRoot: {
            alignItems: "center",
            flexWrap: "nowrap",
            "&:has(.MuiAutocomplete-tag)": {
              flexWrap: "wrap",
              minHeight: "auto",
              paddingTop: "2px",
              paddingBottom: "2px",
            },
            "&:not(:has(.MuiAutocomplete-tag))": {
              minHeight: INPUT_MIN_HEIGHT,
              paddingTop: 0,
              paddingBottom: 0,
              alignItems: "center",
              "& .MuiAutocomplete-input": {
                padding: "0 4px",
                lineHeight: 1.4375,
              },
            },
            "&.MuiInputBase-sizeSmall:not(:has(.MuiAutocomplete-tag))": {
              minHeight: INPUT_MIN_HEIGHT,
              paddingTop: 0,
              paddingBottom: 0,
              alignItems: "center",
            },
            [`${TABLE_SHELL_SCOPE} &`]: {
              "&.MuiInputBase-sizeSmall:not(:has(.MuiAutocomplete-tag))": {
                minHeight: TABLE_INPUT_MIN_HEIGHT,
                paddingTop: 0,
                paddingBottom: 0,
                alignItems: "center",
                "& .MuiAutocomplete-input": {
                  padding: `${TABLE_INPUT_PADDING_BLOCK} 4px`,
                  lineHeight: 1.4375,
                },
              },
            },
          },
          paper: {
            backgroundColor: "var(--app-popover-bg)",
            backgroundImage: "none",
            border:
              "0.0625rem solid color-mix(in srgb, var(--app-surface-border) 72%, transparent)",
          },
          listbox: {
            backgroundColor: "var(--app-popover-bg)",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: "var(--app-popover-bg)",
            backgroundImage: "none",
            border:
              "0.0625rem solid color-mix(in srgb, var(--app-surface-border) 72%, transparent)",
          },
          list: {
            backgroundColor: "var(--app-popover-bg)",
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: "var(--app-popover-bg)",
            backgroundImage: "none",
            border:
              "0.0625rem solid color-mix(in srgb, var(--app-surface-border) 72%, transparent)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: shadows.md,
            backgroundImage: isDark ? "none" : "var(--app-panel-gradient)",
            borderRadius: 0,
            backgroundColor: isDark ? "#141a15" : "#ffffff",
            color: isDark ? "#f5f1eb" : "#171717",
            "& .MuiIconButton-root": {
              color: isDark ? colors.primary.light : colors.primary.dark,
            },
            "& .MuiTypography-root": {
              color: isDark ? "#f5f1eb" : "#171717",
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderLeft: "none",
            borderRight: isDark
              ? "0.0625rem solid rgba(255, 255, 255, 0.08)"
              : "0.0625rem solid rgba(23, 23, 23, 0.08)",
            backgroundImage: "none",
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          asterisk: {
            color: colors.error.main,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          sizeSmall: {
            "&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": {
              transform: "translate(14px, 16px) scale(1)",
            },
            [`${TABLE_SHELL_SCOPE} &`]: {
              "&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": {
                transform: "translate(14px, 9px) scale(1)",
              },
              'html[dir="rtl"] &.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
                transform: "translate(-14px, 9px) scale(1)",
              },
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            ...transparentInputChrome,
            "&.MuiInputBase-sizeSmall:not(.MuiInputBase-multiline):not(:has(.MuiAutocomplete-tag))":
              {
                minHeight: INPUT_MIN_HEIGHT,
                alignItems: "center",
              },
            [`${TABLE_SHELL_SCOPE} &`]: {
              "&.MuiInputBase-sizeSmall:not(.MuiInputBase-multiline):not(:has(.MuiAutocomplete-tag))":
                {
                  minHeight: TABLE_INPUT_MIN_HEIGHT,
                  alignItems: "center",
                },
            },
            "& .MuiInputBase-input": {
              ...transparentInputChrome,
            },
          },
          inputSizeSmall: {
            "&:not(.MuiInputBase-inputMultiline)": {
              padding: "0 14px",
              lineHeight: 1.4375,
              height: "auto",
            },
            [`${TABLE_SHELL_SCOPE} &`]: {
              "&:not(.MuiInputBase-inputMultiline)": {
                paddingTop: TABLE_INPUT_PADDING_BLOCK,
                paddingBottom: TABLE_INPUT_PADDING_BLOCK,
                lineHeight: 1.4375,
                height: "auto",
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: inputRadius,
            ...transparentInputChrome,
            "&:not(.MuiInputBase-multiline)": {
              minHeight: INPUT_MIN_HEIGHT,
              alignItems: "center",
            },
            [`${TABLE_SHELL_SCOPE} &`]: {
              "&.MuiInputBase-sizeSmall:not(.MuiInputBase-multiline):not(:has(.MuiAutocomplete-tag))":
                {
                  minHeight: TABLE_INPUT_MIN_HEIGHT,
                  alignItems: "center",
                },
              "&.MuiInputBase-sizeSmall:not(.MuiInputBase-multiline) .MuiInputBase-input:not(.MuiInputBase-inputMultiline), &.MuiInputBase-sizeSmall:not(.MuiInputBase-multiline) .MuiSelect-select":
                {
                  paddingTop: TABLE_INPUT_PADDING_BLOCK,
                  paddingBottom: TABLE_INPUT_PADDING_BLOCK,
                  lineHeight: 1.4375,
                  height: "auto",
                },
            },
            "&.MuiInputBase-multiline": {
              minHeight: "auto",
            },
            "&:not(.MuiInputBase-multiline) .MuiInputBase-input:not(.MuiInputBase-inputMultiline), &:not(.MuiInputBase-multiline) .MuiSelect-select":
              {
                paddingTop: 0,
                paddingBottom: 0,
                lineHeight: 1.4375,
              },
            "&:hover": {
              ...transparentInputChrome,
            },
            "&.Mui-focused": {
              ...transparentInputChrome,
            },
            "&.Mui-disabled": {
              ...transparentInputChrome,
            },
            "& .MuiInputBase-input": {
              ...transparentInputChrome,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              transition: "box-shadow 180ms ease",
              "&.Mui-focused": {
                boxShadow: isDark
                  ? "0 0 0 4px rgba(201, 166, 107, 0.12)"
                  : "0 0 0 4px rgba(201, 166, 107, 0.18)",
              },
              "&:hover": {
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.secondary.main,
                },
              },
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(201, 166, 107, 0.12)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: chipRadius,
            fontWeight: 600,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: listItemRadius,
            "&.Mui-selected": {
              backgroundColor: colors.primary.main,
              color: colors.primary.contrastText,
              "&:hover": {
                backgroundColor: colors.primary.dark,
              },
              "& .MuiListItemIcon-root": {
                color: colors.primary.contrastText,
              },
            },
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          leaveTouchDelay: 3000,
        },
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? colors.grey[700] : colors.grey[800],
            fontSize: "0.75rem",
            padding: "0.5rem 0.75rem",
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: ({ theme }) => ({
            position: "relative",
            overflow: "hidden",
            "&:not(.MuiAvatar-rounded):not(.app-avatar--plain)": {
              boxShadow: `0 0 0 2px ${alpha(
                theme.palette.primary.main,
                theme.palette.mode === "dark" ? 0.55 : 0.42
              )}`,
            },
            "&.app-avatar--plain": {
              boxShadow: "none",
            },
          }),
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            "&.app-snackbar-alert": {
              backgroundImage: "none",
              "&.MuiAlert-filledSuccess": {
                backgroundColor: darkColors.success.dark,
                color: "#ffffff",
                "& .MuiAlert-message, & .MuiTypography-root": { color: "#ffffff" },
                "& .MuiAlert-icon": { color: "#ffffff", opacity: 1 },
                "& .MuiAlert-action .MuiIconButton-root": { color: "#ffffff" },
              },
              "&.MuiAlert-filledError": {
                backgroundColor: darkColors.error.dark,
                color: "#ffffff",
                "& .MuiAlert-message, & .MuiTypography-root": { color: "#ffffff" },
                "& .MuiAlert-icon": { color: "#ffffff", opacity: 1 },
                "& .MuiAlert-action .MuiIconButton-root": { color: "#ffffff" },
              },
              "&.MuiAlert-filledWarning": {
                backgroundColor: darkColors.warning.dark,
                color: "#ffffff",
                "& .MuiAlert-message, & .MuiTypography-root": { color: "#ffffff" },
                "& .MuiAlert-icon": { color: "#ffffff", opacity: 1 },
                "& .MuiAlert-action .MuiIconButton-root": { color: "#ffffff" },
              },
              "&.MuiAlert-filledInfo": {
                backgroundColor: darkColors.info.dark,
                color: "#ffffff",
                "& .MuiAlert-message, & .MuiTypography-root": { color: "#ffffff" },
                "& .MuiAlert-icon": { color: "#ffffff", opacity: 1 },
                "& .MuiAlert-action .MuiIconButton-root": { color: "#ffffff" },
              },
            },
          },
          ...(isDark
            ? {}
            : {
                filledInfo: {
                  backgroundColor: "#e8edf5",
                  color: "#3d4f6a",
                  "& .MuiAlert-message, & .MuiTypography-root": {
                    color: "#3d4f6a",
                  },
                  "& .MuiAlert-icon": {
                    color: "#4a5d7a",
                  },
                  "& .MuiAlert-action .MuiIconButton-root": {
                    color: "#4a5d7a",
                  },
                },
                filledSuccess: {
                  backgroundColor: "#e3f2eb",
                  color: colors.success.dark,
                  "& .MuiAlert-message, & .MuiTypography-root": {
                    color: colors.success.dark,
                  },
                  "& .MuiAlert-icon": {
                    color: colors.success.dark,
                  },
                  "& .MuiAlert-action .MuiIconButton-root": {
                    color: colors.success.dark,
                  },
                },
                filledWarning: {
                  backgroundColor: "#fdf3e3",
                  color: colors.warning.dark,
                  "& .MuiAlert-message, & .MuiTypography-root": {
                    color: colors.warning.dark,
                  },
                  "& .MuiAlert-icon": {
                    color: colors.warning.dark,
                  },
                  "& .MuiAlert-action .MuiIconButton-root": {
                    color: colors.warning.dark,
                  },
                },
                filledError: {
                  backgroundColor: "#fce8e8",
                  color: colors.error.dark,
                  "& .MuiAlert-message, & .MuiTypography-root": {
                    color: colors.error.dark,
                  },
                  "& .MuiAlert-icon": {
                    color: colors.error.dark,
                  },
                  "& .MuiAlert-action .MuiIconButton-root": {
                    color: colors.error.dark,
                  },
                },
              }),
        },
      },
    },
  });
};

/** Class applied to snackbar `Alert` roots — uses dark filled tones in every theme mode. */
export const SNACKBAR_ALERT_CLASS = "app-snackbar-alert";

/** Solid filled snackbar tones — matches MUI `filled` Alert in dark mode. */
const SNACKBAR_FILLED_ALERT_TONES: Record<AlertColor, { backgroundColor: string; color: string }> =
  {
    success: { backgroundColor: darkColors.success.dark, color: "#ffffff" },
    error: { backgroundColor: darkColors.error.dark, color: "#ffffff" },
    warning: { backgroundColor: darkColors.warning.dark, color: "#ffffff" },
    info: { backgroundColor: darkColors.info.dark, color: "#ffffff" },
  };

export function getSnackbarFilledAlertTone(severity: AlertColor): {
  backgroundColor: string;
  color: string;
} {
  return SNACKBAR_FILLED_ALERT_TONES[severity];
}

/** Snackbars always use dark-mode filled Alert colors (light theme pastel Alert overrides do not apply). */
export function getSnackbarFilledAlertSx(severity: AlertColor): SxProps<Theme> {
  const tone = SNACKBAR_FILLED_ALERT_TONES[severity];
  return {
    "&&": {
      backgroundColor: `${tone.backgroundColor} !important`,
      backgroundImage: "none !important",
      color: `${tone.color} !important`,
    },
    "& .MuiAlert-message, & .MuiTypography-root": {
      color: `${tone.color} !important`,
    },
    "& .MuiAlert-icon": {
      color: `${tone.color} !important`,
      opacity: 1,
    },
    "& .MuiAlert-action .MuiIconButton-root": {
      color: `${tone.color} !important`,
    },
  };
}
