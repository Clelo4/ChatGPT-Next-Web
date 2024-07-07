import styles from "./auth.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import { useEffect, useState } from "react";
import { getClientConfig } from "../config/client";
import LoginWithGoogle from "../common/components/LoginWithGoogle";
import TurnstileCaptcha from "../common/components/TurnstileCaptcha";

export function AuthPage() {
  const navigate = useNavigate();
  const accessStore = useAccessStore();
  const [cfToken, setCfToken] = useState<string>();

  const goHome = () => navigate(Path.Home);
  const goChat = () => navigate(Path.Chat);
  const resetAccessCode = () => {
    accessStore.update((access) => {
      access.openaiApiKey = "";
      access.accessCode = "";
    });
  }; // Reset access code to empty string

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkCFTurnstile = () => {
    // setNeedCfCaptcha(false);
  };

  return (
    <div className={styles["auth-page"]}>
      <div className={`no-dark ${styles["auth-logo"]}`}>
        <BotIcon />
      </div>

      <div className={styles["auth-title"]}>{Locale.Auth.Title}</div>
      {/* <div className={styles["auth-tips"]}>{Locale.Auth.Tips}</div> */}

      {/* <input
        className={styles["auth-input"]}
        type="password"
        placeholder={Locale.Auth.Input}
        value={accessStore.accessCode}
        onChange={(e) => {
          accessStore.update(
            (access) => (access.accessCode = e.currentTarget.value),
          );
        }}
      /> */}
      {cfToken ? (
        <LoginWithGoogle
          clientId="659771653697-1nrsdqhb9gg7opesinsov7cu8bo03h9r.apps.googleusercontent.com"
          csrfToken={cfToken}
        ></LoginWithGoogle>
      ) : (
        <TurnstileCaptcha
          siteKey="0x4AAAAAAAeaY4kLR970jYsy"
          onSuccess={(token) => {
            setCfToken(token);
          }}
        ></TurnstileCaptcha>
      )}

      {!accessStore.hideUserApiKey ? (
        <>
          <div className={styles["auth-tips"]}>{Locale.Auth.SubTips}</div>
          <input
            className={styles["auth-input"]}
            type="password"
            placeholder={Locale.Settings.Access.OpenAI.ApiKey.Placeholder}
            value={accessStore.openaiApiKey}
            onChange={(e) => {
              accessStore.update(
                (access) => (access.openaiApiKey = e.currentTarget.value),
              );
            }}
          />
          <input
            className={styles["auth-input"]}
            type="password"
            placeholder={Locale.Settings.Access.Google.ApiKey.Placeholder}
            value={accessStore.googleApiKey}
            onChange={(e) => {
              accessStore.update(
                (access) => (access.googleApiKey = e.currentTarget.value),
              );
            }}
          />
        </>
      ) : null}

      <div className={styles["auth-actions"]}>
        {/* <IconButton
          text={Locale.Auth.Confirm}
          type="primary"
          onClick={checkCFTurnstile}
          className={styles["auth-next"]}
        /> */}
        {/* <IconButton
          text={Locale.Auth.Later}
          onClick={() => {
            resetAccessCode();
            goHome();
          }}
        /> */}
      </div>
    </div>
  );
}
