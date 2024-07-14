import { ChatControllerPool } from "@/app/client/controller";
import React, { useState } from "react";
import ChatAction from "../ChatAction";
import Locale from "@locales/index";

import ImageIcon from "@icons/image.svg";
import BottomIcon from "@icons/bottom.svg";
import RobotIcon from "@icons/robot.svg";
import BreakIcon from "@icons/break.svg";
import SettingsIcon from "@icons/chat-settings.svg";
import LoadingButtonIcon from "@icons/loading.svg";
import StopIcon from "@icons/pause.svg";
import styles from "../../chat.module.scss";
import { observer } from "mobx-react-lite";

const ChatActions = (props: {
  uploadImage: () => void;
  setAttachImages: (images: string[]) => void;
  setUploading: (uploading: boolean) => void;
  showPromptModal: () => void;
  scrollToBottom: () => void;
  showPromptHints: () => void;
  hitBottom: boolean;
  uploading: boolean;
}) => {
  // stop all responses
  const couldStop = ChatControllerPool.hasPending();
  const stopAll = () => ChatControllerPool.stopAll();

  // switch model
  const [showUploadImage, setShowUploadImage] = useState(false);

  return (
    <div className={styles["chat-input-actions"]}>
      {couldStop && (
        <ChatAction
          onClick={stopAll}
          text={Locale.Chat.InputActions.Stop}
          icon={<StopIcon />}
        />
      )}
      {!props.hitBottom && (
        <ChatAction
          onClick={props.scrollToBottom}
          text={Locale.Chat.InputActions.ToBottom}
          icon={<BottomIcon />}
        />
      )}
      {props.hitBottom && (
        <ChatAction
          onClick={props.showPromptModal}
          text={Locale.Chat.InputActions.Settings}
          icon={<SettingsIcon />}
        />
      )}

      {showUploadImage && (
        <ChatAction
          onClick={props.uploadImage}
          text={Locale.Chat.InputActions.UploadImage}
          icon={props.uploading ? <LoadingButtonIcon /> : <ImageIcon />}
        />
      )}

      <ChatAction
        text={Locale.Chat.InputActions.Clear}
        icon={<BreakIcon />}
        onClick={() => {
          // chatStore.updateCurrentSession((session) => {
          //   if (session.clearContextIndex === session.messages.length) {
          //     session.clearContextIndex = undefined;
          //   } else {
          //     session.clearContextIndex = session.messages.length;
          //     session.memoryPrompt = ""; // will clear memory
          //   }
          // });
        }}
      />
    </div>
  );
};

export default observer(ChatActions);
