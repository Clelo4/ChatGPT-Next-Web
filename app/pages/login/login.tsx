import styles from "./login.module.scss";

import { useNavigate } from "react-router-dom";
import Locale from "../../locales";

import BotIcon from "@icons/bot.svg";
import React, { useState } from "react";
import LoginWithGoogle from "@components/LoginWithGoogle";
import TurnstileCaptcha from "@components/TurnstileCaptcha";
import Button from "@components/Button";
import { loginAPI, logoutAPI } from "@client/api";
import { observer } from "mobx-react-lite";
import { useStore } from "@app/store";

export function LoginPage() {
  const navigate = useNavigate();
  const [cfToken, setCfToken] = useState<string>();
  const { userStore } = useStore();

  const handleLogin = async () => {
    await loginAPI();
    window.location.reload();
  };

  const handleLogout = async () => {
    await logoutAPI();
    window.location.reload();
  };

  return (
    <div className={styles["login-page"]}>
      <div className={`no-dark ${styles["login-logo"]}`}>
        <BotIcon />
      </div>

      <div className={styles["login-title"]}>{Locale.Auth.Title}</div>
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

      {userStore?.isAuthenticated ? (
        <Button onClick={handleLogout} text="登出"></Button>
      ) : (
        <Button onClick={handleLogin} text="登录"></Button>
      )}
    </div>
  );
}

export default observer(LoginPage);
