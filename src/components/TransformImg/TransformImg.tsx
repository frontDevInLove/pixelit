import { FC, useEffect, useRef, useState } from "react";
import style from "./TransformImg.module.scss";
// import { PixelSvg } from "../PixelSvg";

// Определение интерфейса для пропсов компонента
interface Props {
  colors?: string[]; // Опциональный массив цветов
  imageSrc?: string; // Опциональный путь к изображению
}

// Массив цветов по умолчанию
const defaultColors: string[] = [
  "#DBCABB",
  "#CCA996",
  "#99756E",
  "#58415D",
  "#224260",
  "#07090E",
];

/**
 * Функция для загрузки изображения и отрисовки его на канвасе.
 * @param context - контекст канваса для рисования.
 * @param image - объект изображения для отрисовки.
 * @param dw - ширина целевого изображения на канвасе.
 * @param dh - высота целевого изображения на канвасе.
 */
const loadImg = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  dw = 300,
  dh = 300,
): void => {
  context.drawImage(image, 0, 0, dw, dh);
};

/**
 * Пикселизирует изображение на канвасе, изменяя его так, чтобы оно состояло из заданного количества пикселей
 * по горизонтали и вертикали. Это достигается путем усреднения цветов внутри каждого "большого пикселя".
 *
 * @param {CanvasRenderingContext2D} context - Контекст рендеринга канваса, на котором будет пикселизировано изображение.
 * @param {number} countPixelX - Желаемое количество пикселей по горизонтальной оси (X).
 * @param {number} countPixelY - Желаемое количество пикселей по вертикальной оси (Y).
 */
const pixelateImage = (
  context: CanvasRenderingContext2D,
  countPixelX: number,
  countPixelY: number,
): void => {
  const imgData: ImageData = context.getImageData(
    0,
    0,
    context.canvas.width,
    context.canvas.height,
  );
  const { width, height } = imgData;

  // Вычисляем размеры "большого пикселя" на основе желаемого количества пикселей по каждой оси
  const pixelWidth: number = width / countPixelX;
  const pixelHeight: number = height / countPixelY;

  for (let y = 0; y < height; y += pixelHeight) {
    for (let x = 0; x < width; x += pixelWidth) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      let count = 0;

      // Определяем средний цвет для текущего "большого пикселя"
      for (let dy = 0; dy < pixelHeight; dy++) {
        for (let dx = 0; dx < pixelWidth; dx++) {
          const ix = Math.floor(x + dx);
          const iy = Math.floor(y + dy);
          if (ix < width && iy < height) {
            const index = (iy * width + ix) * 4;
            r += imgData.data[index];
            g += imgData.data[index + 1];
            b += imgData.data[index + 2];
            a += imgData.data[index + 3];
            count++;
          }
        }
      }

      r /= count;
      g /= count;
      b /= count;
      a /= count;

      // Присваиваем средний цвет всем пикселям в текущем "большом пикселе"
      for (let dy = 0; dy < pixelHeight; dy++) {
        for (let dx = 0; dx < pixelWidth; dx++) {
          const ix = Math.floor(x + dx);
          const iy = Math.floor(y + dy);
          if (ix < width && iy < height) {
            const index = (iy * width + ix) * 4;
            imgData.data[index] = r;
            imgData.data[index + 1] = g;
            imgData.data[index + 2] = b;
            imgData.data[index + 3] = a;
          }
        }
      }
    }
  }

  // Возвращаем измененные данные на холст
  context.putImageData(imgData, 0, 0);
};

/**
 * Находит наиболее подходящий цвет из массива к заданному цвету.
 * @param currentColor - Текущий цвет пикселя в формате RGB.
 * @param colors - Массив доступных цветов в hex формате.
 * @returns Строка с hex-значением наиболее подходящего цвета.
 */
const findClosestColor = (
  currentColor: { r: number; g: number; b: number },
  colors: string[],
): string => {
  let closestColor = "";
  let smallestDifference = Infinity;

  colors.forEach((hex) => {
    const { r: targetR, g: targetG, b: targetB } = hexToRGB(hex);
    const difference = Math.sqrt(
      (currentColor.r - targetR) ** 2 +
        (currentColor.g - targetG) ** 2 +
        (currentColor.b - targetB) ** 2,
    );

    if (difference < smallestDifference) {
      closestColor = hex;
      smallestDifference = difference;
    }
  });

  return closestColor;
};

/**
 * Конвертирует hex-значение цвета в объект с компонентами RGB.
 * @param hex - Строка с hex-значением цвета.
 * @returns Объект с компонентами RGB.
 */
const hexToRGB = (hex: string): { r: number; g: number; b: number } => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

/**
 * Перекрашивает изображение в наиболее подходящие цвета из предоставленного массива.
 * @param context - Контекст рендеринга 2D канваса.
 * @param colors - Массив доступных цветов в hex формате.
 * @returns Двумерный массив с hex-значениями цветов для каждого пикселя.
 */
const recolorImage = (
  context: CanvasRenderingContext2D,
  colors: string[],
): string[][] => {
  const imgData = context.getImageData(
    0,
    0,
    context.canvas.width,
    context.canvas.height,
  );
  const result: string[][] = [];

  for (let y = 0; y < imgData.height; y++) {
    const row: string[] = [];
    for (let x = 0; x < imgData.width; x++) {
      const index = (y * imgData.width + x) * 4;
      const currentColor = {
        r: imgData.data[index],
        g: imgData.data[index + 1],
        b: imgData.data[index + 2],
      };
      const closestColor = findClosestColor(currentColor, colors);
      row.push(closestColor);

      const { r, g, b } = hexToRGB(closestColor);
      imgData.data[index] = r;
      imgData.data[index + 1] = g;
      imgData.data[index + 2] = b;
    }
    result.push(row);
  }

  context.putImageData(imgData, 0, 0);
  return result;
};

const TransformImg: FC<Props> = ({ colors = defaultColors, imageSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [colorMatrix, setColorMatrix] = useState<string[][]>([]);
  const [showColors, setShowColors] = useState(false);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const conutPixel = 128;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Создаем новый объект изображения
    const image = new Image();

    // Указываем путь к изображению
    image.src = imageSrc ?? "";

    // Отрисовываем изображение на canvas после загрузки
    image.onload = () => {
      loadImg(context, image); // Загружаем изображение
      pixelateImage(context, conutPixel, conutPixel); // Трансформируем изображение в пиксельное
      const arrColors = recolorImage(context, colors); // Перекрашиваем изображение

      setColorMatrix(arrColors);
    };
  }, [imageSrc, colors]);

  return (
    <div className={style.resultWrapper}>
      <canvas ref={canvasRef} width={300} height={300} />

      <div className={style.resultWrapper__colors}>
        <button onClick={() => setShowColors((prev) => !prev)}>
          {showColors ? "Скрыть уникальные цвета" : "Показать уникальные цвета"}
        </button>
        {showColors && (
          <ul>
            {colors.map((color, index) => (
              <li key={index} style={{ borderBottom: `3px solid ${color}` }}>
                {color}
                <div style={{ background: color }}></div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={style.resultWrapper__puzzle}>
        <button onClick={() => setShowPuzzle(true)}>
          Показать пазл {conutPixel}x{conutPixel}
        </button>

        <div className={style.resultWrapper__puzzle} style={{ marginTop: 20 }}>
          <button onClick={() => location.reload()}>Начать сначала</button>
        </div>

        {showPuzzle && (
          <div className={style.modal}>
            {colorMatrix.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className={style.modal__row}>
                {/* Используем более уникальный ключ для строки */}
                {row.map((color, colIndex) => (
                  // Комбинируем rowIndex и colIndex для создания уникального ключа для каждого элемента
                  <div
                    key={`col-${rowIndex}-${colIndex}`}
                    style={{
                      backgroundColor: color, // Используйте backgroundColor для задания цвета фона
                    }}
                    className={style.modal__cell}
                  />

                  // <PixelSvg
                  //   key={`col-${rowIndex}-${colIndex}`}
                  //   baseColor={color}
                  // />
                ))}
              </div>
            ))}
          </div>
        )}

        {showPuzzle && (
          <div className={style.close} onClick={() => setShowPuzzle(false)}>
            &#10006;
          </div>
        )}
      </div>
    </div>
  );
};

export default TransformImg;
