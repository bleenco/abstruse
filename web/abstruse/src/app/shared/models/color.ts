import { color } from 'd3-color';

const colors = {
  blue: '#32A8E4',
  green: '#34AA44',
  yellow: '#FACF55',
  red: '#E6492D',
  gray: '#6B6C6F',
  violet: '#6758F3',
  orange: '#F6AB2F'
};

export const Colors = Object.keys(colors).map(key => colors[key]);
export const ColorsSchemeBlue = createScheme(colors.blue);
export const ColorsSchemeGreen = createScheme(colors.green);
export const ColorsSchemeYellow = createScheme(colors.yellow);
export const ColorsSchemeRed = createScheme(colors.red);
export const ColorsSchemeGray = createScheme(colors.gray);
export const ColorsSchemeViolet = createScheme(colors.violet);
export const ColorsSchemeOrange = createScheme(colors.orange);

function createScheme(hex: string): string[] {
  const clr = color(hex);
  return [].concat(
    ...[.2, .4, .6, .8].map(i => clr.brighter(i).hex()),
    hex,
    ...[.2, .4, .6, .8].map(i => clr.darker(i).hex())
  );
}
