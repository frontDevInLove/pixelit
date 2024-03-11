import { FC, useCallback, useEffect, useRef, useState } from "react";
import useImage from "use-image";
import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";
import style from "./ImageCanvas.module.scss";

interface Props {
  image: File;
  onExport: (dataUrl: string) => void;
  reset: () => void;
}

const ImageCanvas: FC<Props> = ({ image, onExport, reset }) => {
  const mobileDimension = window.innerWidth < 700;

  const [imageSrc, setImageSrc] = useState("");
  const [konvaImage] = useImage(imageSrc);
  const [scale, setScale] = useState(mobileDimension ? 0.5 : 1);
  const [windowSize, setWindowSize] = useState(
    mobileDimension ? { width: 150, height: 150 } : { width: 300, height: 300 },
  );
  const [windowStage, setWindowStage] = useState(
    mobileDimension ? { width: 300, height: 300 } : { width: 600, height: 600 },
  );
  const stageRef = useRef(null);

  useEffect(() => {
    if (image) {
      const fileUrl = URL.createObjectURL(image);
      setImageSrc(fileUrl);
      return () => URL.revokeObjectURL(fileUrl);
    }
  }, [image]);

  const windowPosition = {
    x: (windowStage.width - windowSize.width) / 2,
    y: (windowStage.height - windowSize.height) / 2,
  };

  const handleZoomIn = useCallback(() => {
    setScale(scale + 0.1); // Увеличиваем масштаб
  }, [scale]);

  const handleZoomOut = useCallback(() => {
    setScale(scale - 0.1); // Уменьшаем масштаб
  }, [scale]);

  const handleSave = useCallback(() => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({
        // +1 и -2 — это фикс рамки на превью, возможно, каким-то иным способом это можно сделать
        x: windowPosition.x + 1,
        y: windowPosition.y + 1,
        width: windowSize.width - 2,
        height: windowSize.height - 2,
        pixelRatio: 1, // Установите pixelRatio в соответствии с требуемым качеством изображения
      });
      onExport(dataURL);
    }
  }, [
    onExport,
    windowPosition.x,
    windowPosition.y,
    windowSize.width,
    windowSize.height,
  ]);

  const handleResize = () => {
    if (mobileDimension) {
      setWindowSize({ width: 150, height: 150 });
      setWindowStage({ width: 300, height: 300 });
      setScale(0.5);
    } else {
      setWindowSize({ width: 300, height: 300 });
      setWindowStage({ width: 600, height: 600 });
      setScale(1);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <div>
      <Stage
        width={windowStage.width}
        height={windowStage.height}
        ref={stageRef}
        className={style.canvasWrapper}
      >
        <Layer>
          <KonvaImage
            image={konvaImage}
            draggable
            scale={{ x: scale, y: scale }}
          />
        </Layer>
        <Layer>
          {/* Темный слой поверх всего, кроме "окна" */}
          <Rect
            x={0}
            y={0}
            width={window.innerWidth}
            height={windowPosition.y}
            fill="rgba(0,0,0,0.8)"
          />
          <Rect
            x={0}
            y={windowPosition.y}
            width={windowPosition.x}
            height={windowSize.height}
            fill="rgba(0,0,0,0.8)"
          />
          <Rect
            x={windowPosition.x + windowSize.width}
            y={windowPosition.y}
            width={window.innerWidth - windowPosition.x - windowSize.width}
            height={windowSize.height}
            fill="rgba(0,0,0,0.8)"
          />
          <Rect
            x={0}
            y={windowPosition.y + windowSize.height}
            width={window.innerWidth}
            height={window.innerHeight - windowPosition.y - windowSize.height}
            fill="rgba(0,0,0,0.8)"
          />

          {/* Рамка вокруг "окна" */}
          <Rect
            x={windowPosition.x}
            y={windowPosition.y}
            width={windowSize.width}
            height={windowSize.height}
            stroke="#FFFF00"
            strokeWidth={2}
            listening={false} // Эта рамка не должна принимать события мыши
          />
        </Layer>
      </Stage>
      <div className={style.btnWrapper}>
        <button onClick={handleZoomIn}>Увеличить</button>
        <button onClick={handleZoomOut}>Уменьшить</button>
        <button onClick={handleSave}>Сохранить выделенное</button>
        <button onClick={reset}>Сбросить</button>
      </div>
    </div>
  );
};

export default ImageCanvas;
