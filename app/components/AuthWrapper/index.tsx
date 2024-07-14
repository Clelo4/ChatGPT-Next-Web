"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@app/store";
import useUserHook from "@hook/useUserHook";
import { observer } from "mobx-react-lite";

interface IProps {
  children: React.ReactNode;
}

const LOGIN_PATH = "/login";

/**
 * A function to get the callback URL.
 *
 * @return {string} The callback URL extracted from the current URL.
 */
const getCallbackUrl = () => {
  const url = new URL(window.location.href);
  const callbackUrl = url.searchParams.get("callback") || "/";
  const defaultCallbackUrl = "/";

  // parse callbackUrl and extract origin from callbackUrl
  if (/^(http:\/\/| https:\/\/)/.test(callbackUrl)) {
    try {
      const callbackUrlParsed = new URL(callbackUrl);
      if (callbackUrlParsed.origin === location.origin) {
        return callbackUrl;
      }
    } catch (error) {
      console.log("Error parsing callbackUrl", error);
    }
  } else if (/^(\/)/.test(callbackUrl)) {
    return callbackUrl;
  }
  return defaultCallbackUrl;
};

/**
 * AuthWrapper component is a wrapper component that checks the user's authentication status and redirects them accordingly.
 */
const AuthWrapper = (props: IProps) => {
  const { userStore } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  const { checkUserAuth } = useUserHook();

  useEffect(() => {
    const checkAuth = async () => {
      await checkUserAuth();
      setIsLoading(false);
    };

    checkAuth();
  }, [userStore]);

  if (isLoading) {
    return <div>Loading</div>;
  }

  const path = window.location.pathname;

  if (path === LOGIN_PATH && !userStore?.isAuthenticated) {
    return props.children;
  } else if (path === LOGIN_PATH && userStore?.isAuthenticated) {
    window.location.href = getCallbackUrl();
    return null;
  } else if (!userStore?.isAuthenticated) {
    window.location.href = LOGIN_PATH;
    return null;
  } else {
    return props.children;
  }
};

export default observer(AuthWrapper);
