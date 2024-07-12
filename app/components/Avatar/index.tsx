import React from "react";
import BotIcon from "@icons/bot.svg";
import EmojiAvatar from "../EmojiAvatar";

export default function Avatar(props: { model?: any; avatar?: string }) {
  if (props.model) {
    return (
      <div className="no-dark">
        <BotIcon className="user-avatar" />
      </div>
    );
  }

  return (
    <div className="user-avatar">
      {props.avatar && <EmojiAvatar avatar={props.avatar} />}
    </div>
  );
}
