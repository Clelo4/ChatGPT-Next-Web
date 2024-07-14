"use client";

import React, { useEffect } from "react";
import ChatStore from "@store/ChatStore";
import UserStore from "@store/UserStore";
import SystemStore from "@store/SystemStore";
import PromptStore from "@store/PromptStore";

const chatStore = new ChatStore();
const userStore = new UserStore();
const systemStore = new SystemStore();
const promptStore = new PromptStore();

const StoreContext = React.createContext<{
  chatStore: ChatStore;
  userStore: UserStore;
  systemStore: SystemStore;
  promptStore: PromptStore;
}>({ chatStore, userStore, systemStore, promptStore });

export const StoreProvider = (props: { children: React.ReactNode }) => {
  useEffect(() => {
    console.log("StoreProvider init");
  }, []);

  return (
    <StoreContext.Provider
      value={{ chatStore, userStore, systemStore, promptStore }}
    >
      {props.children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
