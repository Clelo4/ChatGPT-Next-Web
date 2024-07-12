import { Theme, useAppConfig } from "../store";

// 获取当前主题
const useGetThemeHook = () => {
  const config = useAppConfig();

  if ([Theme.Dark, Theme.Light].includes(config.theme)) return config.theme;
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    // 当前主题为暗黑模式
    return Theme.Dark;
  } else {
    // 当前主题为明亮模式
    return Theme.Light;
  }
};

export default useGetThemeHook;
