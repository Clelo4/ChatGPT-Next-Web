import { Theme } from "@app/constant";
import { useStore } from "@app/store";

const useGetThemeHook = () => {
  const { systemStore } = useStore();

  if ([Theme.Dark, Theme.Light].includes(systemStore?.theme))
    return systemStore?.theme;
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
