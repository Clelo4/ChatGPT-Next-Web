"use client";

import React, { useMemo } from "react";
import Script from "next/script";
import { hashStringUsingSHA256 } from "@/app/utils/crypto";

interface IProps {
  clientId: string;
  csrfToken: string;
  onSuccess?: (response: any) => void;
}

const LoginWithGoogle = (props: IProps) => {
  const { clientId, csrfToken, onSuccess } = props;

  const validateToken = async (token: string) => {
    const payload = {
      method: "POST",
      body: JSON.stringify({ token, csrfToken }),
      // signal: controller.signal,
    };

    const res = await fetch("/api/auth/google", payload);

    console.log("validateToken", res);
  };

  const init = () => {
    if (window?.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        ux_mode: "popup",
        auto_select: true,
        nonce: hashStringUsingSHA256(csrfToken),
        callback: (response: any) => {
          console.log("[LoginWithGoogle] callback", response);
          validateToken(response?.credential);
        },
      });
      const parent = document.getElementById("google_login_btn");
      window.google.accounts.id.renderButton(parent, {
        theme: "outline",
        shape: "circle",
      });
      // window.google.accounts.id.prompt((notification: any) => {
      //   if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      //     // try next provider if OneTap is not displayed or skipped
      //     console.warn("Login with Google's prompt is not displayed or skipped");
      //   }
      // });
    }
  };

  const onSignout = () => {
    window?.google?.accounts?.id?.disableAutoSelect?.();
  };

  const content = useMemo(() => {
    return (
      <>
        <Script
          src="https://accounts.google.com/gsi/client"
          onLoad={init}
        ></Script>
        <div id="google_login_btn"></div>
      </>
    );
  }, []);

  return content;
};

export default LoginWithGoogle;
