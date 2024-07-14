import { makeAutoObservable } from "mobx";
import { ROLE } from "@app/constant";
import mockDataList from "./mock.json";

export interface MultimodalContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface ChatMessage {
  role: ROLE;
  content: string | MultimodalContent[];
  id: string;
  date: string;
  streaming: boolean;
}

export interface ChatType {
  id: string;
  messages: ChatMessage[];
  topic: string;
  createdAt?: string;
}

let messageId = +new Date();

const roleMap = {
  user: ROLE.USER,
  system: ROLE.SYSTEM,
  assistant: ROLE.ASSISTANT,
};

const moreMessages: ChatMessage[] = mockDataList.map((data) => ({
  role: roleMap[data.role as "user" | "system" | "assistant"],
  content: data.content,
  id: String(++messageId),
  date: new Date().toLocaleDateString(),
  streaming: false,
}));

const mockChatList = [
  {
    id: "chat-1",
    messages: [...moreMessages],
    topic: "ChatGPT",
    createdAt: "2022-01-01 00:00:00",
  },
  {
    id: "chat-2",
    messages: [],
    topic: "ChatGPT2",
    createdAt: "2022-01-01 00:00:00",
  },
];

class ChatStore {
  private currentChatId?: string;

  chatList: Array<ChatType> = mockChatList;

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentChat(id: string) {
    this.currentChatId = id;
  }

  getCurrentChat(): ChatType | undefined {
    const targetId = this.getCurrentChatId();
    if (!targetId) return undefined;
    const found = this.chatList.find((item) => item.id === targetId);
    if (found) return found;
    return undefined;
  }

  removeChat(chatId: string) {
    this.chatList = this.chatList.filter((item) => item.id !== chatId);
    if (this.currentChatId === chatId) {
      this.currentChatId = undefined;
    }
  }

  getCurrentChatId() {
    if (
      this.currentChatId !== "" &&
      this.currentChatId !== undefined &&
      this.currentChatId !== null
    )
      return this.currentChatId;
    if (this.chatList.length > 0) return this.chatList[0].id;
    return null;
  }
}

export default ChatStore;
