import React from "react";
import SessionConfigModel from "../SessionConfigModel";

import BrainIcon from "@icons/brain.svg";
import styles from "../../chat.module.scss";
import { useStore } from "@app/store";

function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;
}) {
  const { chatStore } = useStore();
  const session = chatStore.currentSession();

  return (
    <div className={styles["prompt-toast"]} key="prompt-toast">
      {props.showToast && (
        <div
          className={styles["prompt-toast-inner"] + " clickable"}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
        </div>
      )}
      {props.showModal && (
        <SessionConfigModel onClose={() => props.setShowModal(false)} />
      )}
    </div>
  );
}

export default PromptToast;
