import { ROLE } from "@app/constant";
import { $fetch } from "@app/utils/request";

export interface ChatRequestMessage {
  role: ROLE;
  content: string;
}

export const loginAPI = async () => {
  return await $fetch("/api/user/login", {});
};

export const logoutAPI = async () => {
  return await $fetch("/api/user/logout", {});
};

export const getUserInfoAPI = async () => {
  return await $fetch("/api/user/info", {});
};
