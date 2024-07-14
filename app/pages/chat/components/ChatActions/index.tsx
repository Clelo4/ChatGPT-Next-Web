import { ChatControllerPool } from "@/app/client/controller";
import { Selector, showToast } from "@/app/components/ui-lib";
import { isVisionModel } from "@/app/utils";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatAction from "../ChatAction";
import Locale from "@locales/index";

import ImageIcon from "@icons/image.svg";
import LightIcon from "@icons/light.svg";
import DarkIcon from "@icons/dark.svg";
import AutoIcon from "@icons/auto.svg";
import BottomIcon from "@icons/bottom.svg";
import RobotIcon from "@icons/robot.svg";
import BreakIcon from "@icons/break.svg";
import SettingsIcon from "@icons/chat-settings.svg";
import LoadingButtonIcon from "@icons/loading.svg";
import PromptIcon from "@icons/prompt.svg";
import StopIcon from "@icons/pause.svg";
import styles from "../../chat.module.scss";
import { useStore } from "@app/store";
import { Theme } from "@app/constant";
import { observer } from "mobx-react-lite";

function ChatActions(props: {
  uploadImage: () => void;
  setAttachImages: (images: string[]) => void;
  setUploading: (uploading: boolean) => void;
  showPromptModal: () => void;
  scrollToBottom: () => void;
  showPromptHints: () => void;
  hitBottom: boolean;
  uploading: boolean;
}) {
  const { systemStore, chatStore } = useStore();
  const navigate = useNavigate();

  // switch themes
  const theme = systemStore.theme;
  function nextTheme() {
    const themes = [Theme.Auto, Theme.Light, Theme.Dark];
    const themeIndex = themes.indexOf(theme);
    const nextIndex = (themeIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    systemStore.setTheme(nextTheme);
  }

  // stop all responses
  const couldStop = ChatControllerPool.hasPending();
  const stopAll = () => ChatControllerPool.stopAll();

  // switch model
  const currentModel = "gpt3";
  const models = [];
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);

  // useEffect(() => {
  //   const show = isVisionModel(currentModel);
  //   setShowUploadImage(show);
  //   if (!show) {
  //     props.setAttachImages([]);
  //     props.setUploading(false);
  //   }
  //
  //   // if current model is not available
  //   // switch to first available model
  //   const isUnavaliableModel = !models.some((m) => m.name === currentModel);
  //   if (isUnavaliableModel && models.length > 0) {
  //     // show next model to default model if exist
  //     let nextModel = models.find((model) => model.isDefault) || models[0];
  //     showToast(nextModel.name);
  //   }
  // }, [chatStore, currentModel, models]);

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
        onClick={nextTheme}
        text={""}
        icon={
          <>
            {theme === Theme.Auto ? (
              <AutoIcon />
            ) : theme === Theme.Light ? (
              <LightIcon />
            ) : theme === Theme.Dark ? (
              <DarkIcon />
            ) : null}
          </>
        }
      />

      <ChatAction
        onClick={props.showPromptHints}
        text={Locale.Chat.InputActions.Prompt}
        icon={<PromptIcon />}
      />

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

      <ChatAction
        onClick={() => setShowModelSelector(true)}
        text={currentModel}
        icon={<RobotIcon />}
      />

      {showModelSelector && (
        <Selector
          defaultSelectedValue={`${currentModel}@`}
          items={models.map((m) => ({
            title: `${m.displayName}${
              m?.provider?.providerName
                ? "(" + m?.provider?.providerName + ")"
                : ""
            }`,
            value: `${m.name}@${m?.provider?.providerName}`,
          }))}
          onClose={() => setShowModelSelector(false)}
          onSelection={(s) => {
            if (s.length === 0) return;
            const [model, providerName] = s[0].split("@");
            showToast(model);
          }}
        />
      )}
    </div>
  );
}

export default observer(ChatActions);
