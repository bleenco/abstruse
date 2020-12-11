export function hexToRgba(hex: string, alpha: number = 1): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) {
    return hex;
  }

  return `rgba(${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}, ${alpha})`;
}
