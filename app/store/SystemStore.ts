import { makeAutoObservable } from "mobx";
import { DEFAULT_SIDEBAR_WIDTH, SubmitKey, Theme } from "@app/constant";

class SystemStore {
  theme: Theme = Theme.Light;
  sidebarWidth: number = DEFAULT_SIDEBAR_WIDTH;
  fontSize: string = "14px";
  submitKey: SubmitKey = SubmitKey.ShiftEnter;

  constructor() {
    makeAutoObservable(this);
  }

  setTheme(theme: Theme) {
    this.theme = theme;
  }

  setSidebarWidth(width: number) {
    this.sidebarWidth = width;
  }

  setFontSize(fontSize: string) {
    this.fontSize = fontSize;
  }
}

export default SystemStore;
