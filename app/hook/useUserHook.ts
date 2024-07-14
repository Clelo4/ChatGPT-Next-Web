import React from "react";
import { useStore } from "@app/store";
import { getUserInfoAPI } from "@client/api";

const useUserHook = () => {
  const { userStore } = useStore();

  const checkUserAuth = async () => {
    try {
      const data = await getUserInfoAPI(); // 你的认证检查 API
      console.log("isAuthenticated, ", data);
      userStore.setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  return {
    checkUserAuth,
  };
};

export default useUserHook;
