import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";

import Locale from "../../locales";
import { useNavigate } from "react-router-dom";
import { Path } from "@app/constant";
import { showConfirm } from "../ui-lib";
import { useMobileScreen } from "@app/utils";
import ChatItem from "./ChatItem";
import { useStore } from "@app/store";
import { observer } from "mobx-react-lite";

export function ChatList(props: { narrow?: boolean }) {
  const { chatStore } = useStore();
  const navigate = useNavigate();
  const isMobileScreen = useMobileScreen();
  const { chatList, currentChatId } = chatStore;

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // moveSession(source.index, destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chat-list">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {chatList.map((item, i) => (
              <ChatItem
                title={item?.topic || Locale.Store.DefaultTopic}
                count={item?.messages?.length || 0}
                key={item.id}
                id={item.id}
                index={i}
                selected={item.id === currentChatId}
                time={item.createdAt}
                onClick={() => {
                  navigate(Path.Chat);
                  chatStore.setCurrentChat(item.id);
                }}
                onDelete={async () => {
                  if (
                    (!props.narrow && !isMobileScreen) ||
                    (await showConfirm(Locale.Home.DeleteChat))
                  ) {
                    chatStore.removeChat(item.id);
                  }
                }}
                narrow={props.narrow}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default observer(ChatList);
