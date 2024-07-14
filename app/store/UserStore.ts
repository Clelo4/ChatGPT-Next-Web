import { makeAutoObservable, runInAction } from "mobx";
import { $fetch } from "@app/utils/request";
import { getUserInfoAPI } from "@client/api";

class UserStore {
  isAuthenticated = false;
  name?: string = "Junjie Cheng";
  email?: string = "chengjunjie.jack@gmail.com";
  avatar?: string =
    "https://lh3.googleusercontent.com/ogw/AF2bZyipe8CfCDZzFE7Npb7N-nvL5z-wrNKqwMOv71hVcvgFLA=s32-c-mo";

  constructor() {
    makeAutoObservable(this);
  }

  setIsAuthenticated(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated;
  }
}

export default UserStore;
