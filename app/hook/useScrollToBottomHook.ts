import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useMobileScreen } from "@app/utils";

// A custom hook that provides functionality for automatically scrolling to the bottom of the scrollRef.
const useScrollToBottomHook = (
  scrollRef: RefObject<HTMLDivElement>,
  detach: boolean = false,
) => {
  const isMobileScreen = useMobileScreen();

  const threshold = useMemo(() => (isMobileScreen ? 4 : 10), [isMobileScreen]);

  const [isHitBottom, setIsHitBottom] = useState(true);
  // for auto-scroll
  const [autoScroll, setAutoScroll] = useState(true);
  function scrollDomToBottom() {
    const dom = scrollRef.current;
    if (dom) {
      requestAnimationFrame(() => {
        setAutoScroll(true);
        dom.scrollTo(0, dom.scrollHeight);
      });
    }
  }

  const handleScroll = useCallback(() => {
    const dom = scrollRef.current;
    if (dom) {
      const isScrolledToBottom =
        Math.abs(dom.scrollHeight - dom.clientHeight - dom.scrollTop) <=
        threshold;
      setAutoScroll(isScrolledToBottom);
      setIsHitBottom(isScrolledToBottom);
    }
  }, [scrollRef]);

  useEffect(() => {
    const dom = scrollRef.current;
    if (dom) {
      dom.addEventListener("scroll", handleScroll);
      return () => dom.removeEventListener("scroll", handleScroll);
    }
  }, [scrollRef, handleScroll]);

  // auto scroll
  useEffect(() => {
    if (autoScroll && !detach) {
      scrollDomToBottom();
    }
  });

  return {
    isHitBottom,
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollDomToBottom,
  };
};

export default useScrollToBottomHook;
