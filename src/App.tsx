import MyDropzone from "./components/MyDropzone";
import { useState } from "react";
import ImageCanvas from "./components/ImageCanvas";
import TransformImg from "./components/TransformImg";

function App() {
  const [image, setImage] = useState<File | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  // Корректный вызов
  const onImageUpload = (file: File) => {
    restart();
    setImage(file);
    setStep(1);
  };

  const onExport = (image: string) => {
    setImageData(image);
    setStep(2);
  };

  const restart = () => {
    setStep(0);
    setImage(null);
    setImageData(null);
  };

  return (
    <div>
      {/*Загрузка*/}
      <MyDropzone onImageUpload={onImageUpload} />

      <div style={{ justifyContent: "center", display: "flex" }}>
        <div>
          {/*Выбираем область*/}
          {step === 1 && image && (
            <ImageCanvas image={image} onExport={onExport} />
          )}

          {/*Результат нашего выбора*/}
          {step === 2 && imageData && (
            <>
              <img src={imageData} />
              <div>Продложить?</div>
              <button onClick={() => setStep(3)}>Да</button>
              <button onClick={() => setStep(1)}>Назад</button>
            </>
          )}
        </div>

        {step === 3 && imageData && <TransformImg imageSrc={imageData} />}
      </div>
    </div>
  );
}

export default App;

/**
 *
 * У меня есть приложение на реакт.
 * У меня есть изображение.
 * Я храню его в блоб.
 * Мне необходимо сделать это изображение разрешением 300х300.
 * В этом изображении оставить 6 цветов в пиксели черно-белого цвета.
 * Все цвета пикселей сохранить в двумерный массив.
 */
