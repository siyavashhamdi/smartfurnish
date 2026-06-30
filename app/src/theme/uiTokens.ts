import type { PaletteMode } from "@mui/material";

/** Gold primary + forest brand palette (Smart Furnish studio aesthetic). */
export const brandColors = {
  gold: "#c9a66b",
  goldLight: "#e8d3ae",
  goldDark: "#9a7848",
  goldBright: "#d9c39a",
  forest: "#1a2e1f",
  forestLight: "#2a4530",
  cream: "#faf8f5",
  creamDark: "#f0ebe3",
  charcoal: "#0b100c",
  slate: "#5c5c5c",
  paperDark: "#141a15",
  footerBg: "#141f16",
} as const;

/** Elevated card surface — matches test_01 `surfaceCard`. */
export function surfaceCard(mode: PaletteMode) {
  return {
    bgcolor: "background.paper",
    border: 1,
    borderColor: mode === "light" ? "rgba(23, 23, 23, 0.06)" : "rgba(255, 255, 255, 0.06)",
    borderRadius: 1.5,
    boxShadow:
      mode === "light"
        ? "0 1px 2px rgba(154, 120, 72, 0.08), 0 12px 40px rgba(154, 120, 72, 0.12)"
        : "0 1px 2px rgba(0, 0, 0, 0.2), 0 12px 40px rgba(0, 0, 0, 0.25)",
  } as const;
}

/** Inset / dashed upload zone base. */
export function surfaceInset(mode: PaletteMode) {
  return {
    bgcolor: mode === "light" ? "rgba(201, 166, 107, 0.04)" : "rgba(255, 255, 255, 0.03)",
    border: 1,
    borderColor: "divider",
    borderRadius: 1,
  } as const;
}

/** Branded CTA gradient button — gold shimmer in both modes. */
export function primaryButtonSx(mode: PaletteMode) {
  const textColor = brandColors.forest;

  return {
    background:
      mode === "light"
        ? `linear-gradient(135deg, ${brandColors.goldDark} 0%, ${brandColors.gold} 48%, ${brandColors.goldLight} 100%)`
        : `linear-gradient(135deg, ${brandColors.gold} 0%, ${brandColors.goldBright} 50%, ${brandColors.goldLight} 100%)`,
    boxShadow:
      mode === "light"
        ? "0 4px 14px rgba(201, 166, 107, 0.28)"
        : "0 4px 14px rgba(201, 166, 107, 0.22)",
    color: textColor,
    "& .MuiButton-startIcon, & .MuiButton-endIcon, & .MuiSvgIcon-root": {
      color: textColor,
      opacity: 1,
    },
    "&:hover": {
      background:
        mode === "light"
          ? `linear-gradient(135deg, ${brandColors.gold} 0%, ${brandColors.goldLight} 100%)`
          : `linear-gradient(135deg, ${brandColors.goldBright} 0%, ${brandColors.goldLight} 100%)`,
      boxShadow:
        mode === "light"
          ? "0 6px 20px rgba(201, 166, 107, 0.36)"
          : "0 6px 20px rgba(201, 166, 107, 0.3)",
      color: textColor,
      "& .MuiButton-startIcon, & .MuiButton-endIcon, & .MuiSvgIcon-root": {
        color: textColor,
      },
    },
    "&.Mui-disabled": {
      background:
        mode === "light"
          ? "linear-gradient(135deg, rgba(201, 166, 107, 0.45) 0%, rgba(232, 211, 174, 0.45) 100%)"
          : "linear-gradient(135deg, rgba(201, 166, 107, 0.35) 0%, rgba(232, 211, 174, 0.35) 100%)",
      color: mode === "light" ? "rgba(26, 46, 31, 0.45)" : "rgba(11, 16, 12, 0.45)",
    },
  } as const;
}

/** Toolbar / header icon button with readable contrast on panels. */
export function toolbarIconButtonSx(mode: PaletteMode) {
  return {
    color: mode === "light" ? brandColors.goldDark : brandColors.goldLight,
    border: "1px solid",
    borderColor: mode === "light" ? "rgba(201, 166, 107, 0.28)" : "rgba(255, 255, 255, 0.1)",
    bgcolor: mode === "light" ? "rgba(255, 255, 255, 0.72)" : "rgba(20, 26, 21, 0.72)",
    "& .MuiSvgIcon-root": {
      fontSize: "1.25rem",
      opacity: 1,
    },
    "&:hover": {
      color: mode === "light" ? brandColors.gold : brandColors.cream,
      bgcolor: mode === "light" ? "rgba(201, 166, 107, 0.14)" : "rgba(201, 166, 107, 0.16)",
      borderColor: mode === "light" ? "rgba(201, 166, 107, 0.4)" : "rgba(201, 166, 107, 0.45)",
    },
  } as const;
}

/** Gradient CTA used on landing / hero sections — gold shimmer with dark readable text. */
export function gradientCtaButtonSx(mode: PaletteMode) {
  const textColor = brandColors.forest;

  return {
    color: textColor,
    background:
      mode === "light"
        ? `linear-gradient(135deg, ${brandColors.goldDark} 0%, ${brandColors.gold} 55%, ${brandColors.goldLight} 100%)`
        : `linear-gradient(135deg, ${brandColors.gold} 0%, ${brandColors.goldBright} 55%, ${brandColors.goldLight} 100%)`,
    boxShadow:
      mode === "light"
        ? "0 8px 24px rgba(201, 166, 107, 0.3)"
        : "0 8px 24px rgba(201, 166, 107, 0.24)",
    "& .MuiButton-startIcon, & .MuiButton-endIcon, & .MuiSvgIcon-root": {
      color: textColor,
      opacity: 1,
    },
    "&:hover": {
      color: textColor,
      boxShadow:
        mode === "light"
          ? "0 10px 28px rgba(201, 166, 107, 0.38)"
          : "0 10px 28px rgba(201, 166, 107, 0.32)",
    },
  } as const;
}

/** Full-page atmospheric background gradient. */
export function getPageBackground(mode: PaletteMode): string {
  return mode === "light"
    ? `
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201, 166, 107, 0.12), transparent),
      radial-gradient(ellipse 60% 40% at 100% 0%, rgba(26, 46, 31, 0.04), transparent),
      ${brandColors.cream}
    `
    : `
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201, 166, 107, 0.08), transparent),
      radial-gradient(ellipse 60% 40% at 0% 100%, rgba(42, 69, 48, 0.12), transparent),
      ${brandColors.charcoal}
    `;
}

/** Sticky header / app bar frosted background. */
export function getHeaderBackground(mode: PaletteMode): string {
  return mode === "light" ? "rgba(250, 248, 245, 0.78)" : "rgba(11, 16, 12, 0.82)";
}

/** Hero section glow wash. */
export function getHeroGlow(mode: PaletteMode): string {
  return mode === "light"
    ? "radial-gradient(circle at 15% 30%, rgba(201, 166, 107, 0.2), transparent 32%), radial-gradient(circle at 85% 10%, rgba(26, 46, 31, 0.06), transparent 28%)"
    : "radial-gradient(circle at 15% 30%, rgba(201, 166, 107, 0.12), transparent 32%), radial-gradient(circle at 85% 10%, rgba(143, 174, 149, 0.06), transparent 28%)";
}

/** Section background wash. */
export function getStudioBackground(mode: PaletteMode): string {
  return mode === "light"
    ? "linear-gradient(180deg, rgba(201,166,107,0.04) 0%, rgba(250,248,245,0) 60%)"
    : "linear-gradient(180deg, rgba(217,195,154,0.05) 0%, rgba(11,16,12,0) 60%)";
}

/** Dark forest panel (preview cards, modal headers). */
export function getPreviewPanelBackground(_mode: PaletteMode): string {
  return "linear-gradient(145deg, rgba(26,46,31,0.94) 0%, rgba(42,69,48,0.9) 100%)";
}

/** Modal / overlay backdrop tint. */
export function getBackdropColor(): string {
  return "rgba(11, 16, 12, 0.72)";
}
