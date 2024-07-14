import { useEffect, useRef } from "react";
import {
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
} from "@app/constant";
import { useMobileScreen } from "../utils";
import { useStore } from "@app/store";

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const { systemStore } = useStore();

  const startX = useRef(0);
  const startDragWidth = useRef(
    systemStore.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH,
  );
  const lastUpdateTime = useRef(Date.now());

  const toggleSideBar = () => {
    if (systemStore.sidebarWidth < MIN_SIDEBAR_WIDTH) {
      systemStore.sidebarWidth = DEFAULT_SIDEBAR_WIDTH;
      systemStore.setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    } else {
      systemStore.sidebarWidth = NARROW_SIDEBAR_WIDTH;
      systemStore.setSidebarWidth(NARROW_SIDEBAR_WIDTH);
    }
  };

  const onDragStart = (e: MouseEvent) => {
    // Remembers the initial width each time the mouse is pressed
    startX.current = e.clientX;
    startDragWidth.current = systemStore.sidebarWidth;
    const dragStartTime = Date.now();

    const handleDragMove = (e: MouseEvent) => {
      if (Date.now() < lastUpdateTime.current + 20) {
        return;
      }
      lastUpdateTime.current = Date.now();
      const d = e.clientX - startX.current;
      const nextWidth = limit(startDragWidth.current + d);
      if (nextWidth < MIN_SIDEBAR_WIDTH) {
        systemStore.setSidebarWidth(NARROW_SIDEBAR_WIDTH);
      } else {
        systemStore.setSidebarWidth(nextWidth);
      }
    };

    const handleDragEnd = () => {
      // In useRef the data is non-responsive, so `config.sidebarWidth` can't get the dynamic sidebarWidth
      window.removeEventListener("pointermove", handleDragMove);
      window.removeEventListener("pointerup", handleDragEnd);

      // if user click the drag icon, should toggle the sidebar
      const shouldFireClick = Date.now() - dragStartTime < 300;
      if (shouldFireClick) {
        toggleSideBar();
      }
    };

    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
  };

  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && systemStore.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(systemStore.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [systemStore.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragStart,
    shouldNarrow,
  };
}

export default useDragSideBar;
