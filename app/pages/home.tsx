"use client";

import useSwitchThemeHook from "@hook/useSwitchThemeHook";

require("../polyfill");

import { useState, useEffect } from "react";

import styles from "./home.module.scss";

import BotIcon from "@icons/bot.svg";
import LoadingIcon from "@icons/three-dots.svg";

import { useMobileScreen } from "../utils";

import { Path } from "../constant";

import { getISOLang } from "../locales";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import SideBar from "@components/Sidebar";
import LoginPage from "@pages/login/login";
import { getClientConfig } from "@config/client";
import { observer } from "mobx-react-lite";
import Chat from "@pages/chat/chat";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

function useHtmlLang() {
  useEffect(() => {
    const lang = getISOLang();
    const htmlLang = document.documentElement.lang;

    if (lang !== htmlLang) {
      document.documentElement.lang = lang;
    }
  }, []);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

const loadAsyncGoogleFont = () => {
  const linkEl = document.createElement("link");
  const proxyFontUrl = "/google-fonts";
  const remoteFontUrl = "https://fonts.googleapis.com";
  const googleFontUrl =
    getClientConfig()?.buildMode === "export" ? remoteFontUrl : proxyFontUrl;
  linkEl.rel = "stylesheet";
  linkEl.href =
    googleFontUrl +
    "/css2?family=" +
    encodeURIComponent("Noto Sans:wght@300;400;700;900") +
    "&display=swap";
  document.head.appendChild(linkEl);
};

function Screen() {
  const location = useLocation();
  const isHome = location.pathname === Path.Home;
  const isAuth = location.pathname === Path.Login;
  const isMobileScreen = useMobileScreen();
  const shouldTightBorder = true;

  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);

  return (
    <div
      className={
        styles.container +
        ` ${shouldTightBorder ? styles["tight-container"] : styles.container}`
      }
    >
      {isAuth ? (
        <>
          <LoginPage />
        </>
      ) : (
        <>
          <SideBar className={isHome ? styles["sidebar-show"] : ""} />

          <div className={styles["window-content"]}>
            <Routes>
              <Route path={Path.Home} element={<Chat />} />
              <Route path={Path.Chat} element={<Chat />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
}

const Home = () => {
  useSwitchThemeHook();
  useHtmlLang();

  useEffect(() => {
    console.log("[Config] got config from build time", getClientConfig());
  }, []);

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <Router basename="/">
      <Screen />
    </Router>
  );
};

export default observer(Home);
