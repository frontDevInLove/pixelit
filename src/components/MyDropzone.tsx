import {FC, useCallback} from "react";
import {useDropzone} from "react-dropzone";

interface Props {
  onImageUpload: (file: File) => void;
}

const MyDropzone: FC<Props> = ({onImageUpload}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageUpload(file);
    }
  },[onImageUpload]);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
    },
    multiple: false
  });

  return (
    <div {...getRootProps()} style={{ border: '2px dashed #007bff', padding: '20px', textAlign: 'center' }}>
      <input {...getInputProps()} />
      {isDragActive ?
        <p>Отпустите файлы для загрузки...</p> :
        <p>Перетащите файлы сюда, или кликните для выбора файлов</p>
      }
    </div>
  );
};

export default MyDropzone;
