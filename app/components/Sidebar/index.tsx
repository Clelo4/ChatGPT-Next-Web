import { useEffect, useMemo } from "react";

import SettingsIcon from "@icons/settings.svg";
import ChatGptIcon from "@icons/chatgpt.svg";
import AddIcon from "@icons/add.svg";
import DeleteIcon from "@icons/delete.svg";
import DragIcon from "@icons/drag.svg";

import Locale from "@/app/locales";

import { Path } from "@app/constant";

import { Link, useNavigate } from "react-router-dom";
import { isIOS, useMobileScreen } from "@app/utils";
import dynamic from "next/dynamic";
import { showConfirm, showToast } from "../ui-lib";
import Button from "@components/Button";
import styles from "./index.module.scss";
import useDragSideBar from "@/app/hook/useDragSideBarHook";
import { useStore } from "@app/store";
import { observer } from "mobx-react-lite";

const ChatList = dynamic(async () => await import("../ChatList"), {
  loading: () => null,
});

function useHotKey() {
  const { chatStore } = useStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey) {
        if (e.key === "ArrowUp") {
          // chatStore.nextSession(-1);
        } else if (e.key === "ArrowDown") {
          // chatStore.nextSession(1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}

export function SideBar(props: { className?: string }) {
  const { chatStore } = useStore();

  // drag side bar
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const isMobileScreen = useMobileScreen();
  const isIOSMobile = useMemo(
    () => isIOS() && isMobileScreen,
    [isMobileScreen],
  );

  useHotKey();

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
      style={{
        // #3016 disable transition on ios mobile screen
        transition: isMobileScreen && isIOSMobile ? "none" : undefined,
      }}
    >
      <div className={styles["sidebar-header"]} data-tauri-drag-region>
        <div className={styles["sidebar-title"]} data-tauri-drag-region>
          NextChat
        </div>
        <div className={styles["sidebar-sub-title"]}>
          Build your own AI assistant.
        </div>
        <div className={styles["sidebar-logo"] + " no-dark"}>
          <ChatGptIcon />
        </div>
      </div>

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={styles["sidebar-action"] + " " + styles.mobile}>
            <Button
              icon={<DeleteIcon />}
              onClick={async () => {
                if (await showConfirm(Locale.Home.DeleteChat)) {
                  // chatStore.deleteSession(chatStore.currentSessionIndex);
                }
              }}
            />
          </div>
          <div className={styles["sidebar-action"]}>
            <Link to={Path.Settings}>
              <Button icon={<SettingsIcon />} shadow />
            </Link>
          </div>
        </div>
        <div>
          <Button
            icon={<AddIcon />}
            text={shouldNarrow ? undefined : Locale.Home.NewChat}
            onClick={() => {
              // chatStore.newSession();
              navigate(Path.Chat);
            }}
            shadow
          />
        </div>
      </div>

      <div
        className={styles["sidebar-drag"]}
        onPointerDown={(e) => onDragStart(e as any)}
      >
        <DragIcon />
      </div>
    </div>
  );
}

export default observer(SideBar);
