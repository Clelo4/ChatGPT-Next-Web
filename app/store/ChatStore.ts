import { makeAutoObservable } from "mobx";
import { ROLE } from "@app/constant";

interface MessageType {
  role?: ROLE;
  content?: string;
  id: string;
  date?: string;
}

interface ChatType {
  id: string;
  messages?: MessageType[];
  topic?: string;
  createdAt?: string;
}

const mockChatList = [
  {
    id: "chat-1",
    messages: [
      {
        role: ROLE.SYSTEM,
        content:
          "You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.",
        id: "message-1",
      },
      {
        role: ROLE.USER,
        content: "Hello, who are you?",
        id: "message-1",
      },
      {
        role: ROLE.ASSISTANT,
        content: "I am an assistant created by OpenAI.",
        id: "message-2",
      },
    ],
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
  currentChatId?: string;

  chatList: Array<ChatType> = mockChatList;

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentChat(id: string) {
    this.currentChatId = id;
  }

  getCurrentChat(): ChatType | undefined {
    return this.currentChatId
      ? this.chatList.find((item) => item.id === this.currentChatId)
      : undefined;
  }

  removeChat(chatId: string) {
    this.chatList = this.chatList.filter((item) => item.id !== chatId);
    if (this.currentChatId === chatId) {
      this.currentChatId = undefined;
    }
  }
}

export default ChatStore;
