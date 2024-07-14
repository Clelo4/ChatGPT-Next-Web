import Button from "@/app/components/Button";
import { Modal, showConfirm } from "@/app/components/ui-lib";
import React from "react";
import { useNavigate } from "react-router-dom";

import CopyIcon from "@icons/copy.svg";
import ResetIcon from "@icons/reload.svg";
import Locale from "@/app/locales";
import { Path } from "@/app/constant";
import { useStore } from "@app/store";

export function SessionConfigModel(props: { onClose: () => void }) {
  const { chatStore } = useStore();
  const session = chatStore.currentSession();
  const navigate = useNavigate();

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Context.Edit}
        onClose={() => props.onClose()}
        actions={[
          <Button
            key="reset"
            icon={<ResetIcon />}
            bordered
            text={Locale.Chat.Config.Reset}
            onClick={async () => {
              if (await showConfirm(Locale.Memory.ResetConfirm)) {
                chatStore.updateCurrentSession(
                  (session) => (session.memoryPrompt = ""),
                );
              }
            }}
          />,
          <Button
            key="copy"
            icon={<CopyIcon />}
            bordered
            text={Locale.Chat.Config.SaveAs}
            onClick={() => {
              // navigate(Path.Masks);
            }}
          />,
        ]}
      ></Modal>
    </div>
  );
}

export default SessionConfigModel;
