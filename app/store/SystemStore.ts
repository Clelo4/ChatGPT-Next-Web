import { makeAutoObservable } from "mobx";
import { DEFAULT_SIDEBAR_WIDTH, SubmitKey, Theme } from "@app/constant";

const getLocalStorageTheme = () => {
  const theme = localStorage.getItem("theme") as "auto" | "dark" | "light";

  const themeMap = {
    auto: Theme.Auto,
    dark: Theme.Dark,
    light: Theme.Light,
  };

  if (theme && themeMap[theme]) {
    return themeMap[theme];
  }
  return Theme.Auto;
};

const setLocalStorageTheme = (theme: Theme) => {
  const themeMap = {
    [Theme.Auto]: "auto",
    [Theme.Dark]: "dark",
    [Theme.Light]: "light",
  };

  localStorage.setItem("theme", themeMap[theme]);
};

class SystemStore {
  theme: Theme = getLocalStorageTheme();
  sidebarWidth: number = DEFAULT_SIDEBAR_WIDTH;
  fontSize: number = 14;
  submitKey: SubmitKey = SubmitKey.ShiftEnter;
  sendPreviewBubble: boolean = true;

  constructor() {
    makeAutoObservable(this);
  }

  setTheme(theme: Theme) {
    this.theme = theme;
    setLocalStorageTheme(theme);
  }

  setSidebarWidth(width: number) {
    this.sidebarWidth = width;
  }

  setFontSize(fontSize: number) {
    this.fontSize = fontSize;
  }
}

export default SystemStore;
