import { useStore } from "@app/store";
import React, { useEffect, useRef } from "react";
import { SubmitKey } from "@app/constant";

const useSubmitHandlerHook = () => {
  const { systemStore } = useStore();
  const submitKey = systemStore.submitKey;
  const isComposing = useRef(false);

  useEffect(() => {
    const onCompositionStart = () => {
      isComposing.current = true;
    };
    const onCompositionEnd = () => {
      isComposing.current = false;
    };

    window.addEventListener("compositionstart", onCompositionStart);
    window.addEventListener("compositionend", onCompositionEnd);

    return () => {
      window.removeEventListener("compositionstart", onCompositionStart);
      window.removeEventListener("compositionend", onCompositionEnd);
    };
  }, []);

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Fix Chinese input method "Enter" on Safari
    if (e.keyCode == 229) return false;
    if (e.key !== "Enter") return false;
    if (e.key === "Enter" && (e.nativeEvent.isComposing || isComposing.current))
      return false;
    return (
      (systemStore.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (systemStore.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (systemStore.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      (systemStore.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
      (systemStore.submitKey === SubmitKey.Enter &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.metaKey)
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
};

export default useSubmitHandlerHook;
