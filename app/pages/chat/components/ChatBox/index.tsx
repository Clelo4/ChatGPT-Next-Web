import { useStore } from "@app/store";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  autoGrowTextArea,
  copyToClipboard,
  getMessageImages,
  getMessageTextContent,
  isVisionModel,
  selectOrCopy,
  useMobileScreen,
} from "@app/utils";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { LAST_INPUT_KEY, Path, ROLE, UNFINISHED_INPUT } from "@app/constant";
import { ChatControllerPool } from "@client/controller";
import { showConfirm, showPrompt, showToast } from "@components/ui-lib";
import Locale from "@app/locales";
import { getClientConfig } from "@config/client";
import { useCommand } from "@app/command";
import { compressImage } from "@app/utils/chat";
import styles from "@pages/chat/chat.module.scss";
import Button from "@components/Button";
import ReturnIcon from "@icons/return.svg";
import RenameIcon from "@icons/rename.svg";
import EditIcon from "@icons/rename.svg";
import Avatar from "@components/Avatar";
import ChatAction from "@pages/chat/components/ChatAction";
import StopIcon from "@icons/pause.svg";
import ResetIcon from "@icons/reload.svg";
import DeleteIcon from "@icons/clear.svg";
import PinIcon from "@icons/pin.svg";
import CopyIcon from "@icons/copy.svg";
import { RenderPompt } from "@components/PromptHints";
import ChatActions from "@pages/chat/components/ChatActions";
import DeleteImageButton from "@pages/chat/components/DeleteImageButton";
import SendWhiteIcon from "@icons/send-white.svg";
import { observer } from "mobx-react-lite";
import LoadingIcon from "@icons/three-dots.svg";
import { nanoid } from "nanoid";
import { ChatMessage, MultimodalContent } from "@store/ChatStore";
import useScrollToBottomHook from "@hook/useScrollToBottomHook";
import useSubmitHandlerHook from "@hook/useSubmitHandlerHook";
import { Markdown } from "@components/Markdown";

const BOT_HELLO: ChatMessage = {
  role: ROLE.ASSISTANT,
  content: Locale.Store.BotHello,
  id: nanoid(),
  streaming: false,
  date: new Date().toLocaleDateString(),
};

const DEFAULT_TOPIC = Locale.Store.DefaultTopic;

type RenderMessage = ChatMessage & { preview?: boolean };

function createFakeMessage(override: Partial<ChatMessage>): ChatMessage {
  // @ts-ignore
  return {
    id: nanoid(),
    date: new Date().toLocaleString(),
    role: ROLE.USER,
    content: "",
    ...override,
  };
}

const ChatBox = () => {
  const { systemStore, chatStore, promptStore, userStore } = useStore();
  const fontSize = systemStore.fontSize;

  const curChat = chatStore.getCurrentChat();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandlerHook();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isHitBottom, setAutoScroll, scrollDomToBottom } =
    useScrollToBottomHook(scrollRef, false);
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();
  const [attachImages, setAttachImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // prompt hints
  // const [promptHints, setPromptHints] = useState<RenderPompt[]>([]);
  const onSearch = useDebouncedCallback(
    (text: string) => {
      const matchedPrompts = promptStore.search(text);
      // setPromptHints(matchedPrompts);
    },
    100,
    { leading: true, trailing: true },
  );

  // auto grow input
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(
        20,
        Math.max(2 + Number(!isMobileScreen), rows),
      );
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [userInput]);

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    // if (n === 0) {
    //   setPromptHints([]);
    // } else if (!systemStore.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
    //   // check if need to trigger auto completion
    //   if (text.startsWith("/")) {
    //     let searchText = text.slice(1);
    //     onSearch(searchText);
    //   }
    // }
  };

  const doSubmit = async (userInput: string) => {
    if (userInput.trim() === "") return;
    try {
      setIsLoading(true);
      setAttachImages([]);
      localStorage.setItem(LAST_INPUT_KEY, userInput);
      setUserInput("");
      // setPromptHints([]);
      if (!isMobileScreen) inputRef.current?.focus();
      setAutoScroll(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onPromptSelect = (prompt: RenderPompt) => {
    setTimeout(() => {
      // setPromptHints([]);
      // or fill the prompt
      setUserInput(prompt?.content);
      inputRef.current?.focus();
    }, 30);
  };

  // stop response
  const onUserStop = (messageId: string) => {
    if (curChat?.id) ChatControllerPool.stop(curChat?.id, messageId);
  };

  useEffect(() => {
    // chatStore.updateCurrentSession((curChat) => {
    //   const stopTiming = Date.now() - REQUEST_TIMEOUT_MS;
    //   curChat?.messages.forEach((m) => {
    //     // check if should stop all stale messages
    //     if (m?.isError || new Date(m.date).getTime() < stopTiming) {
    //       if (m?.streaming) {
    //         m.streaming = false;
    //       }
    //
    //       if (m?.content.length === 0) {
    //         m.isError = true;
    //         m.content = prettyObject({
    //           error: true,
    //           message: "empty response",
    //         });
    //       }
    //     }
    //   });
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ArrowUp and no userInput, fill with last input
    if (
      e.key === "ArrowUp" &&
      userInput.length <= 0 &&
      !(e.metaKey || e.altKey || e.ctrlKey)
    ) {
      setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
      e.preventDefault();
      return;
    }
    // if (shouldSubmit(e) && promptHints.length === 0) {
    if (shouldSubmit(e)) {
      doSubmit(userInput);
      e.preventDefault();
    }
  };
  const onRightClick = (e: any, message: ChatMessage) => {
    // copy to clipboard
    if (selectOrCopy(e.currentTarget, getMessageTextContent(message))) {
      if (userInput.length === 0) {
        setUserInput(getMessageTextContent(message));
      }

      e.preventDefault();
    }
  };

  const deleteMessage = (msgId?: string) => {};

  const onDelete = (msgId: string) => {
    deleteMessage(msgId);
  };

  // const onResend = (message: ChatMessage) => {
  //   // when it is resending a message
  //   // 1. for a user's message, find the next bot response
  //   // 2. for a bot's message, find the last user's input
  //   // 3. delete original user input and bot's message
  //   // 4. resend the user's input
  //
  //   const resendingIndex = curChat?.messages?.findIndex(
  //     (m) => m?.messageId === message?.messageId,
  //   );
  //
  //   if (resendingIndex < 0 || resendingIndex >= curChat?.messages?.length) {
  //     console.error("[Chat] failed to find resending message", message);
  //     return;
  //   }
  //
  //   let userMessage: ChatMessage | undefined;
  //   let botMessage: ChatMessage | undefined;
  //
  //   if (message?.role === ROLE.ASSISTANT) {
  //     // if it is resending a bot's message, find the user input for it
  //     botMessage = message;
  //     for (let i = resendingIndex; i >= 0; i -= 1) {
  //       if (curChat?.messages[i]?.role === ROLE.USER) {
  //         userMessage = curChat?.messages[i];
  //         break;
  //       }
  //     }
  //   } else if (message?.role === ROLE.USER) {
  //     // if it is resending a user's input, find the bot's response
  //     userMessage = message;
  //     for (let i = resendingIndex; i < curChat?.messages.length; i += 1) {
  //       if (curChat?.messages[i]?.role === ROLE.ASSISTANT) {
  //         botMessage = curChat?.messages[i];
  //         break;
  //       }
  //     }
  //   }
  //
  //   if (userMessage === undefined) {
  //     console.error("[Chat] failed to resend", message);
  //     return;
  //   }
  //
  //   // delete the original messages
  //   deleteMessage(usermessage?.id);
  //   deleteMessage(botMessage?.id);
  //
  //   // resend the message
  //   setIsLoading(true);
  //   const textContent = getMessageTextContent(userMessage);
  //   const images = getMessageImages(userMessage);
  //   chatStore.onUserInput(textContent, images).then(() => setIsLoading(false));
  //   inputRef.current?.focus();
  // };

  const onPinMessage = (message: ChatMessage) => {
    showToast(Locale.Chat.Actions.PinToastContent, {
      text: Locale.Chat.Actions.PinToastAction,
      onClick: () => {
        setShowPromptModal(true);
      },
    });
  };

  const context: RenderMessage[] = useMemo(() => {
    return [];
  }, []);

  if (
    context.length === 0 &&
    curChat?.messages?.at(0)?.content !== BOT_HELLO?.content
  ) {
    const copiedHello = Object.assign({}, BOT_HELLO);
    if (!userStore.isAuthenticated) {
      copiedHello.content = Locale.Error.Unauthorized;
    }
    context.push(copiedHello);
  }

  // preview messages
  const renderMessages = useMemo(() => {
    return context
      .concat(curChat?.messages as RenderMessage[])
      .concat(
        isLoading
          ? [
              {
                ...createFakeMessage({
                  role: ROLE.ASSISTANT,
                  content: "……",
                }),
                preview: true,
              },
            ]
          : [],
      )
      .concat(
        userInput.length > 0 && systemStore.sendPreviewBubble
          ? [
              {
                ...createFakeMessage({
                  role: ROLE.USER,
                  content: userInput,
                }),
                preview: true,
              },
            ]
          : [],
      );
  }, [
    systemStore.sendPreviewBubble,
    context,
    isLoading,
    curChat?.messages,
    userInput,
  ]);

  const messages = useMemo(() => {
    return renderMessages;
  }, [renderMessages]);

  const [showPromptModal, setShowPromptModal] = useState(false);

  const clientConfig = useMemo(() => getClientConfig(), []);

  const autoFocus = !isMobileScreen; // wont auto focus on mobile screen
  const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

  // remember unfinished input
  useEffect(() => {
    if (curChat?.id) {
      // try to load from local storage
      const key = UNFINISHED_INPUT(curChat.id);
      const mayBeUnfinishedInput = localStorage.getItem(key);
      if (mayBeUnfinishedInput && userInput.length === 0) {
        setUserInput(mayBeUnfinishedInput);
        localStorage.removeItem(key);
      }

      const dom = inputRef.current;
      return () => {
        localStorage.setItem(key, dom?.value ?? "");
      };
    }
  }, []);

  const handlePaste = useCallback(
    async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const currentModel = "gpt3";
      if (!isVisionModel(currentModel)) {
        return;
      }
      const items = (event.clipboardData || window.clipboardData).items;
      for (const item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const images: string[] = [];
            images.push(...attachImages);
            images.push(
              ...(await new Promise<string[]>((res, rej) => {
                setUploading(true);
                const imagesData: string[] = [];
                compressImage(file, 256 * 1024)
                  .then((dataUrl) => {
                    imagesData.push(dataUrl);
                    setUploading(false);
                    res(imagesData);
                  })
                  .catch((e) => {
                    setUploading(false);
                    rej(e);
                  });
              })),
            );
            const imagesLength = images.length;

            if (imagesLength > 3) {
              images.splice(3, imagesLength - 3);
            }
            setAttachImages(images);
          }
        }
      }
    },
    [attachImages, chatStore],
  );

  async function uploadImage() {
    const images: string[] = [];
    images.push(...attachImages);

    images.push(
      ...(await new Promise<string[]>((res, rej) => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept =
          "image/png, image/jpeg, image/webp, image/heic, image/heif";
        fileInput.multiple = true;
        fileInput.onchange = (event: any) => {
          setUploading(true);
          const files = event.target.files;
          const imagesData: string[] = [];
          for (let i = 0; i < files.length; i++) {
            const file = event.target.files[i];
            compressImage(file, 256 * 1024)
              .then((dataUrl) => {
                imagesData.push(dataUrl);
                if (
                  imagesData.length === 3 ||
                  imagesData.length === files.length
                ) {
                  setUploading(false);
                  res(imagesData);
                }
              })
              .catch((e) => {
                setUploading(false);
                rej(e);
              });
          }
        };
        fileInput.click();
      })),
    );

    const imagesLength = images.length;
    if (imagesLength > 3) {
      images.splice(3, imagesLength - 3);
    }
    setAttachImages(images);
  }

  return (
    <div className={styles.chat} key={curChat?.id}>
      <div className="window-header" data-tauri-drag-region>
        {isMobileScreen && (
          <div className="window-actions">
            <div className={"window-action-button"}>
              <Button
                icon={<ReturnIcon />}
                bordered
                title={Locale.Chat.Actions.ChatList}
                onClick={() => navigate(Path.Home)}
              />
            </div>
          </div>
        )}

        <div className={`window-header-title ${styles["chat-body-title"]}`}>
          <div
            className={`window-header-main-title ${styles["chat-body-main-title"]}`}
          >
            {!curChat?.topic ? DEFAULT_TOPIC : curChat?.topic}
          </div>
          <div className="window-header-sub-title">
            {Locale.Chat.SubTitle(curChat?.messages?.length || 0)}
          </div>
          {/*<div>renderMessages: {renderMessages?.length} context: {context?.length} renderMessages: {renderMessages?.length} messages: {messages?.length}</div>*/}
        </div>
        <div className="window-actions"></div>
      </div>

      <div
        className={styles["chat-body"]}
        ref={scrollRef}
        onMouseDown={() => inputRef.current?.blur()}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        {messages.map((message, i) => {
          const isUser = message?.role === ROLE.USER;
          const isContext = i < context.length;
          const showActions =
            i > 0 &&
            !(message?.preview || !message?.content?.length) &&
            !isContext;
          const showTyping = message?.preview || message?.streaming;

          return (
            <Fragment key={message?.id}>
              <div
                className={
                  isUser ? styles["chat-message-user"] : styles["chat-message"]
                }
              >
                <div className={styles["chat-message-container"]}>
                  <div className={styles["chat-message-header"]}>
                    <div className={styles["chat-message-avatar"]}>
                      <div className={styles["chat-message-edit"]}>
                        <Button
                          icon={<EditIcon />}
                          onClick={async () => {
                            const newMessage = await showPrompt(
                              Locale.Chat.Actions.Edit,
                              getMessageTextContent(message),
                              10,
                            );
                            let newContent: string | MultimodalContent[] =
                              newMessage;
                            const images = getMessageImages(message);
                            if (images.length > 0) {
                              newContent = [{ type: "text", text: newMessage }];
                              for (let i = 0; i < images.length; i++) {
                                newContent.push({
                                  type: "image_url",
                                  image_url: {
                                    url: images[i],
                                  },
                                });
                              }
                            }
                          }}
                        ></Button>
                      </div>
                      {isUser ? (
                        <Avatar avatar={userStore.avatar} />
                      ) : (
                        <>
                          {[ROLE.SYSTEM].includes(message?.role) ? (
                            <Avatar avatar="2699-fe0f" />
                          ) : null}
                        </>
                      )}
                    </div>

                    {showActions && (
                      <div className={styles["chat-message-actions"]}>
                        <div className={styles["chat-input-actions"]}>
                          {message?.streaming ? (
                            <ChatAction
                              text={Locale.Chat.Actions.Stop}
                              icon={<StopIcon />}
                              onClick={() => onUserStop(message?.id ?? i)}
                            />
                          ) : (
                            <>
                              {/*<ChatAction*/}
                              {/*  text={Locale.Chat.Actions.Retry}*/}
                              {/*  icon={<ResetIcon />}*/}
                              {/*  onClick={() => onResend(message)}*/}
                              {/*/>*/}

                              <ChatAction
                                text={Locale.Chat.Actions.Delete}
                                icon={<DeleteIcon />}
                                onClick={() => onDelete(message?.id ?? i)}
                              />

                              <ChatAction
                                text={Locale.Chat.Actions.Pin}
                                icon={<PinIcon />}
                                onClick={() => onPinMessage(message)}
                              />
                              <ChatAction
                                text={Locale.Chat.Actions.Copy}
                                icon={<CopyIcon />}
                                onClick={() =>
                                  copyToClipboard(
                                    getMessageTextContent(message),
                                  )
                                }
                              />
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {showTyping && (
                    <div className={styles["chat-message-status"]}>
                      {Locale.Chat.Typing}
                    </div>
                  )}
                  <div className={styles["chat-message-item"]}>
                    <Markdown
                      content={getMessageTextContent(message)}
                      loading={
                        (message?.preview || message?.streaming) &&
                        message?.content.length === 0 &&
                        !isUser
                      }
                      onContextMenu={(e) => onRightClick(e, message)}
                      onDoubleClickCapture={() => {
                        if (!isMobileScreen) return;
                        setUserInput(getMessageTextContent(message));
                      }}
                      fontSize={fontSize}
                      parentRef={scrollRef}
                      defaultShow={i >= messages.length - 6}
                    />
                    {getMessageImages(message).length == 1 && (
                      <img
                        className={styles["chat-message-item-image"]}
                        src={getMessageImages(message)[0]}
                        alt=""
                      />
                    )}
                    {getMessageImages(message).length > 1 && (
                      <div
                        className={styles["chat-message-item-images"]}
                        style={
                          {
                            "--image-count": getMessageImages(message).length,
                          } as React.CSSProperties
                        }
                      >
                        {getMessageImages(message).map((image, index) => {
                          return (
                            <img
                              className={
                                styles["chat-message-item-image-multi"]
                              }
                              key={index}
                              src={image}
                              alt=""
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className={styles["chat-message-action-date"]}>
                    {isContext
                      ? Locale.Chat.IsContext
                      : message?.date?.toLocaleString()}
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>

      <div className={styles["chat-input-panel"]}>
        <ChatActions
          uploadImage={uploadImage}
          setAttachImages={setAttachImages}
          setUploading={setUploading}
          showPromptModal={() => setShowPromptModal(true)}
          scrollToBottom={scrollDomToBottom}
          hitBottom={isHitBottom}
          uploading={uploading}
          showPromptHints={() => {
            // Click again to close
            // if (promptHints.length > 0) {
            //   setPromptHints([]);
            //   return;
            // }
            // inputRef.current?.focus();
            // setUserInput("/");
            // onSearch("");
          }}
        />
        <label
          className={`${styles["chat-input-panel-inner"]} ${
            attachImages.length != 0
              ? styles["chat-input-panel-inner-attach"]
              : ""
          }`}
          htmlFor="chat-input"
        >
          <textarea
            id="chat-input"
            ref={inputRef}
            className={styles["chat-input"]}
            placeholder={Locale.Chat.Input(submitKey)}
            onInput={(e) => onInput(e.currentTarget.value)}
            value={userInput}
            onKeyDown={onInputKeyDown}
            onFocus={scrollDomToBottom}
            onClick={scrollDomToBottom}
            onPaste={handlePaste}
            rows={inputRows}
            autoFocus={autoFocus}
            style={{
              fontSize: systemStore.fontSize,
            }}
          />
          {attachImages.length != 0 && (
            <div className={styles["attach-images"]}>
              {attachImages.map((image, index) => {
                return (
                  <div
                    key={index}
                    className={styles["attach-image"]}
                    style={{ backgroundImage: `url("${image}")` }}
                  >
                    <div className={styles["attach-image-mask"]}>
                      <DeleteImageButton
                        deleteImage={() => {
                          setAttachImages(
                            attachImages.filter((_, i) => i !== index),
                          );
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Button
            icon={<SendWhiteIcon />}
            text={Locale.Chat.Send}
            className={styles["chat-input-send"]}
            type="primary"
            onClick={() => doSubmit(userInput)}
          />
        </label>
      </div>
    </div>
  );
};

export default observer(ChatBox);
