import { useEffect } from "react";
import { getCSSVar } from "@app/utils";
import { useStore } from "@app/store";
import { Theme } from "@app/constant";

const useSwitchThemeHook = () => {
  const { systemStore } = useStore();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (systemStore.theme === Theme.Dark) {
      document.body.classList.add("dark");
    } else if (systemStore.theme === Theme.Light) {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (systemStore.theme === Theme.Auto) {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [systemStore.theme]);
};

export default useSwitchThemeHook;
