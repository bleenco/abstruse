export const randomHash = (len?: number): string => {
  const arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join('');
};

const dec2hex = (dec: number): string => {
  return dec < 10 ? '0' + String(dec) : dec.toString(16);
};
