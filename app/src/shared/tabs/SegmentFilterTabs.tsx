import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type TouchEvent,
} from "react";

import { scrollToTopOnMobile } from "../../utils/scrollToTopOnMobile.util";
import styles from "./SegmentFilterTabs.module.scss";

const LONG_PRESS_MS = 450;
const LONG_PRESS_MOVE_TOLERANCE_PX = 12;

type IndicatorMetrics = {
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
};

export type SegmentFilterTabOption<T extends string> = {
  readonly value: T;
  readonly label: string;
};

export type SegmentFilterTabChangeOptions = {
  readonly additiveSelect?: boolean;
};

type SegmentFilterTabsProps<T extends string> = {
  readonly activeTab?: T;
  readonly activeTabs?: readonly T[];
  readonly tabs: ReadonlyArray<SegmentFilterTabOption<T>>;
  readonly onChange: (
    tab: T,
    event: MouseEvent<HTMLButtonElement>,
    options?: SegmentFilterTabChangeOptions,
  ) => void;
  readonly ariaLabel: string;
  readonly columnsPerRow?: number;
  readonly pinned?: boolean;
  /** Where pinned tabs stick: page scroll (mobile) or dialog/modal scroll container. */
  readonly pinnedSurface?: "page" | "dialog";
  readonly disableScrollToTopOnChange?: boolean;
  /** Sets `data-{pinnedAnchorId}` on the tablist when pinned (for scroll offset hooks). */
  readonly pinnedAnchorId?: string;
  /** Touch-and-hold selects in addition to the current selection (like Shift+click). */
  readonly longPressMultiSelect?: boolean;
};

function SegmentFilterTabs<T extends string>({
  activeTab,
  activeTabs,
  tabs,
  onChange,
  ariaLabel,
  columnsPerRow,
  pinned = false,
  pinnedSurface = "page",
  disableScrollToTopOnChange = false,
  pinnedAnchorId,
  longPressMultiSelect = false,
}: SegmentFilterTabsProps<T>): ReactElement {
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<T, HTMLButtonElement>());
  const [indicatorMetrics, setIndicatorMetrics] = useState<IndicatorMetrics | null>(null);
  const [indicatorAnimated, setIndicatorAnimated] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTabRef = useRef<T | null>(null);
  const longPressHandledRef = useRef(false);
  const touchStartPointRef = useRef<{ readonly x: number; readonly y: number } | null>(null);
  const indicatorTab =
    activeTabs != null
      ? activeTabs.length === 1
        ? activeTabs[0]
        : undefined
      : activeTab;

  const clearLongPressTimer = useCallback((): void => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearLongPressTimer, [clearLongPressTimer]);

  const updateIndicator = useCallback((): void => {
    const container = tabListRef.current;
    const activeButton = indicatorTab ? tabRefs.current.get(indicatorTab) : undefined;

    if (!container || !activeButton) {
      setIndicatorMetrics(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const tabRect = activeButton.getBoundingClientRect();

    setIndicatorMetrics({
      width: tabRect.width,
      height: tabRect.height,
      x: tabRect.left - containerRect.left,
      y: tabRect.top - containerRect.top,
    });
  }, [indicatorTab]);

  useLayoutEffect(() => {
    updateIndicator();
    setIndicatorAnimated(true);
  }, [updateIndicator, tabs]);

  useLayoutEffect(() => {
    const container = tabListRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateIndicator();
    });

    observer.observe(container);
    window.addEventListener("resize", updateIndicator);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  const emitTabChange = useCallback(
    (
      tab: T,
      event: MouseEvent<HTMLButtonElement>,
      options?: SegmentFilterTabChangeOptions,
    ): void => {
      onChange(tab, event, options);
      if (!disableScrollToTopOnChange) {
        scrollToTopOnMobile();
      }
    },
    [disableScrollToTopOnChange, onChange],
  );

  const handleTabClick = useCallback(
    (tab: T, event: MouseEvent<HTMLButtonElement>): void => {
      if (longPressHandledRef.current) {
        longPressHandledRef.current = false;
        event.preventDefault();
        return;
      }

      emitTabChange(tab, event);
    },
    [emitTabChange],
  );

  const handleTouchStart = useCallback(
    (tab: T, event: TouchEvent<HTMLButtonElement>): void => {
      if (!longPressMultiSelect) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      touchStartPointRef.current = { x: touch.clientX, y: touch.clientY };
      longPressTabRef.current = tab;
      longPressHandledRef.current = false;
      clearLongPressTimer();

      longPressTimerRef.current = setTimeout(() => {
        const pressedTab = longPressTabRef.current;
        const button = pressedTab ? tabRefs.current.get(pressedTab) : undefined;
        if (!pressedTab || !button) {
          return;
        }

        longPressHandledRef.current = true;
        emitTabChange(
          pressedTab,
          {
            currentTarget: button,
            shiftKey: true,
          } as MouseEvent<HTMLButtonElement>,
          { additiveSelect: true },
        );
        clearLongPressTimer();
      }, LONG_PRESS_MS);
    },
    [clearLongPressTimer, emitTabChange, longPressMultiSelect],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLButtonElement>): void => {
      if (!longPressMultiSelect || !touchStartPointRef.current) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      const deltaX = Math.abs(touch.clientX - touchStartPointRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartPointRef.current.y);
      if (deltaX > LONG_PRESS_MOVE_TOLERANCE_PX || deltaY > LONG_PRESS_MOVE_TOLERANCE_PX) {
        clearLongPressTimer();
      }
    },
    [clearLongPressTimer, longPressMultiSelect],
  );

  const handleTouchEnd = useCallback((): void => {
    clearLongPressTimer();
    touchStartPointRef.current = null;
    longPressTabRef.current = null;
  }, [clearLongPressTimer]);

  const pinnedClassName =
    pinnedSurface === "dialog" ? styles.filterTabsPinnedDialog : styles.filterTabsPinned;
  const tabListClassName = [
    styles.filterTabs,
    columnsPerRow ? styles.filterTabsMultiRow : "",
    pinned ? pinnedClassName : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={tabListRef}
      className={tabListClassName}
      role="tablist"
      aria-label={ariaLabel}
      style={
        columnsPerRow
          ? ({ "--segment-tabs-columns": String(columnsPerRow) } as CSSProperties)
          : undefined
      }
      {...(pinned ? { "data-opaque-shell": true } : {})}
      {...(pinned && pinnedAnchorId ? { [`data-${pinnedAnchorId}`]: "" } : {})}
    >
      {indicatorMetrics ? (
        <span
          aria-hidden="true"
          className={`${styles.filterTabIndicator}${
            indicatorAnimated ? ` ${styles.filterTabIndicatorAnimated}` : ""
          }`}
          style={{
            width: indicatorMetrics.width,
            height: indicatorMetrics.height,
            transform: `translate3d(${indicatorMetrics.x}px, ${indicatorMetrics.y}px, 0)`,
          }}
        />
      ) : null}
      {tabs.map((tab) => {
        const isActive =
          activeTabs != null ? activeTabs.includes(tab.value) : activeTab === tab.value;
        const showActiveBackground = activeTabs != null && activeTabs.length > 1 && isActive;

        return (
          <button
            key={tab.value}
            ref={(element) => {
              if (element) {
                tabRefs.current.set(tab.value, element);
              } else {
                tabRefs.current.delete(tab.value);
              }
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.filterTab}${
              columnsPerRow ? ` ${styles.filterTabGridCell}` : ""
            }${isActive ? ` ${styles.filterTabActive}` : ""}${
              showActiveBackground ? ` ${styles.filterTabActiveBackground}` : ""
            }`}
            onClick={(event) => handleTabClick(tab.value, event)}
            onTouchStart={(event) => handleTouchStart(tab.value, event)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onContextMenu={
              longPressMultiSelect
                ? (event) => {
                    event.preventDefault();
                  }
                : undefined
            }
          >
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentFilterTabs;
