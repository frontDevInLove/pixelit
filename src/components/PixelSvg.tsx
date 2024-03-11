import { adjust } from "../utils";

type Props = { baseColor: string };

export const PixelSvg = ({ baseColor }: Props) => {
  const circleColor = adjust(baseColor, 18);
  const lightShadow = adjust(baseColor, 75);
  const darkShadow = adjust(baseColor, -49);

  return (
    <svg
      width="78"
      height="78"
      viewBox="0 0 78 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="78" height="78" fill={baseColor} />
      <ellipse cx="42" cy="41.5" rx="21" ry="21.5" fill={darkShadow} />
      <circle cx="37.5" cy="36.5" r="21.5" fill={lightShadow} />
      <circle cx="38.5" cy="37.5" r="21.5" fill={circleColor} />
    </svg>
  );
};
