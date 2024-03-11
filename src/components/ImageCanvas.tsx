import {FC, useCallback, useEffect, useRef, useState} from "react";
import useImage from "use-image";
import {Stage, Layer, Image as KonvaImage,  Rect} from 'react-konva';
interface Props {
  image: File;
  onExport: (dataUrl: string) => void;
}

const ImageCanvas: FC<Props> = ({image, onExport}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [konvaImage] = useImage(imageSrc);
  const [scale, setScale] = useState(1);
  const stageRef = useRef(null);

  useEffect(() => {
    if (image) {
      const fileUrl = URL.createObjectURL(image);
      setImageSrc(fileUrl);
      return () => URL.revokeObjectURL(fileUrl);
    }
  }, [image]);

  // Определяем размеры и положение "окна"
  const windowSize = { width: 300, height: 300 };
  const windowStage = { width: 600, height: 600 };

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
        x: windowPosition.x,
        y: windowPosition.y,
        width: windowSize.width,
        height: windowSize.height,
        pixelRatio: 1 // Установите pixelRatio в соответствии с требуемым качеством изображения
      });
      onExport(dataURL);
    }
  }, [onExport, windowPosition.x, windowPosition.y, windowSize.width, windowSize.height]);

  return (
    <>

    <Stage width={windowStage.width} height={windowStage.height} ref={stageRef}>
      <Layer>
        <KonvaImage image={konvaImage} draggable scale={{ x: scale, y: scale }} />
      </Layer>
      <Layer>
        {/* Темный слой поверх всего, кроме "окна" */}
        <Rect
          x={0}
          y={0}
          width={window.innerWidth}
          height={windowPosition.y}
          fill="rgba(0,0,0,0.8)" />
        <Rect
          x={0}
          y={windowPosition.y}
          width={windowPosition.x}
          height={windowSize.height}
          fill="rgba(0,0,0,0.8)" />
        <Rect
          x={windowPosition.x + windowSize.width}
          y={windowPosition.y}
          width={window.innerWidth - windowPosition.x - windowSize.width}
          height={windowSize.height}
          fill="rgba(0,0,0,0.8)" />
        <Rect
          x={0}
          y={windowPosition.y + windowSize.height}
          width={window.innerWidth}
          height={window.innerHeight - windowPosition.y - windowSize.height}
          fill="rgba(0,0,0,0.8)" />

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

      <button onClick={handleZoomIn}>Увеличить</button>
      <button onClick={handleZoomOut}>Уменьшить</button>
      <button onClick={handleSave}>Сохранить выделенное</button>
    </>
  );
};

export default ImageCanvas;
