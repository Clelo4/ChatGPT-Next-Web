"use client";

import { useStore } from "@/app/store";
import React from "react";
import Locale from "@locales/index";
import styles from "../../chat.module.scss";

function ClearContextDivider() {
  const { chatStore } = useStore();

  return (
    <div
      className={styles["clear-context"]}
      onClick={() => {
        // chatStore.updateCurrentSession(
        //     (session) => (session.clearContextIndex = undefined),
        // )
      }}
    >
      <div className={styles["clear-context-tips"]}>{Locale.Context.Clear}</div>
      <div className={styles["clear-context-revert-btn"]}>
        {Locale.Context.Revert}
      </div>
    </div>
  );
}

export default ClearContextDivider;
