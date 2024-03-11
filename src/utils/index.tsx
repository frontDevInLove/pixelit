export const adjust = (baseColor: string, amount: number) => {
  return (
    "#" +
    baseColor
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substring(color.length - 1),
      )
  );
};
