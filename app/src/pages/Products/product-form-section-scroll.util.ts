import type { ProductSectionTab } from "./product-section-tabs.shared";

function findProductFormScrollContainer(
  preferredContainer?: HTMLElement | null
): HTMLElement | null {
  if (preferredContainer) {
    return preferredContainer;
  }

  const tabsShell = document.querySelector<HTMLElement>("[data-product-form-tabs]");
  const startNode =
    tabsShell ??
    document.querySelector<HTMLElement>(
      "#product-form-intro, #product-form-content, #product-form-reviews",
    );

  let node = startNode?.parentElement ?? null;
  while (node) {
    const { overflowY } = window.getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return node;
    }
    node = node.parentElement;
  }

  return startNode?.closest<HTMLElement>(".MuiDialogContent-root") ?? null;
}

function resetProductFormScrollContainer(scrollContainer?: HTMLElement | null): void {
  const container = findProductFormScrollContainer(scrollContainer);
  if (!container) {
    return;
  }

  container.scrollTop = 0;
  container.scrollLeft = 0;
}

function scheduleProductFormScrollReset(scrollContainer?: HTMLElement | null): void {
  resetProductFormScrollContainer(scrollContainer);

  requestAnimationFrame(() => {
    resetProductFormScrollContainer(scrollContainer);
    requestAnimationFrame(() => resetProductFormScrollContainer(scrollContainer));
  });

  window.setTimeout(() => resetProductFormScrollContainer(scrollContainer), 0);
}

export function scrollToProductFormSection(
  _section: ProductSectionTab,
  scrollContainer?: HTMLElement | null,
): void {
  scheduleProductFormScrollReset(scrollContainer);
}
