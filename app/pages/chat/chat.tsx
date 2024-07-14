"use client";

import React from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "@app/store";

import ChatBox from "@pages/chat/components/ChatBox";

const Chat = () => {
  const { chatStore } = useStore();
  const sessionIndex = chatStore.getCurrentChatId();
  return <ChatBox key={sessionIndex}></ChatBox>;
};

export default observer(Chat);
