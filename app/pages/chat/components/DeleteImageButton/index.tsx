import React from "react";
import DeleteIcon from "@icons/delete.svg";
import styles from "../../chat.module.scss";

function DeleteImageButton(props: { deleteImage: () => void }) {
  return (
    <div className={styles["delete-image"]} onClick={props.deleteImage}>
      <DeleteIcon />
    </div>
  );
}

export default DeleteImageButton;
