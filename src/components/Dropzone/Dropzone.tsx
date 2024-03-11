import { FC, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import style from "./Dropzone.module.scss";
import cn from "classnames";

interface Props {
  onImageUpload: (file: File) => void;
}

const Dropzone: FC<Props> = ({ onImageUpload }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onImageUpload(file);
      }
    },
    [onImageUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn([style.dropzone], { [style.dragActive]: isDragActive })}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Отпустите файлы для загрузки...</p>
      ) : (
        <p>Перетащите файлы сюда, или кликните для выбора файлов</p>
      )}
    </div>
  );
};

export default Dropzone;
