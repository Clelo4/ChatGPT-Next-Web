import { jsonPost } from "@/app/utils/request";
import Script from "next/script";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface IProps {
  siteKey: string;
  onSuccess?: (token: string) => void;
  onError?: () => void;
}

const validateCaptcha = async (token: string) => {
  try {
    const data = await jsonPost<{ jwtToken: string }>("/api/auth/cloudflare", {
      token,
    });

    return data?.jwtToken;
  } catch (error) {
    return false;
  }
};

const TurnstileCaptcha = (props: IProps) => {
  const { siteKey, onSuccess, onError } = props;
  const widgetIdRef = useRef<string>();

  // This is the function that resets the captcha widget
  // which will give you a new token
  // routing to a new page will create a new widget with new widgetId
  // it is crucial to call the reset with the widgetId
  const resetWidget = useCallback(() => {
    if (window && window?.turnstile) {
      window.turnstile.reset(widgetIdRef?.current);
    }
  }, []);

  const initializeCaptcha = () => {
    if (window?.turnstile) {
      const id = window.turnstile.render("#cpt-trnstl-container", {
        sitekey: siteKey,
        theme: "light",
        callback: async function (token: string) {
          const jwtToken = await validateCaptcha(token);
          if (jwtToken) onSuccess?.(jwtToken);
          else {
            resetWidget();
            onError?.();
          }
        },
        "error-callback": (error?: any) => {
          console.log("challenge error", error);
          resetWidget();
        },
      });
      widgetIdRef.current = id;
      console.log("widgetId", id);
    }
  };

  useEffect(() => {
    if (window) {
      window.onloadTurnstileCallback = initializeCaptcha;
    }

    return () => {
      if (window) window.onloadTurnstileCallback = null;
    };
  }, []);

  const content = useMemo(() => {
    return (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
          async
          defer
          strategy="lazyOnload"
        ></Script>
        <div id="cpt-trnstl-container" />
      </>
    );
  }, []);

  // Since the Next.js is a single page application
  // the captcha widget will not be re-rendered on route change
  // so we need to issue a re-render manually
  useEffect(() => {
    initializeCaptcha();
  }, [content]);

  return content;
};

export default TurnstileCaptcha;
