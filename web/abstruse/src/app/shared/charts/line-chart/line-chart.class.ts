import { Line, line, Area, area } from 'd3-shape';
import { min, max, range } from 'd3-array';
import { scaleLinear, scaleTime, scalePoint, ScalePoint, ScaleLinear, ScaleTime } from 'd3-scale';
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import {
  DEFAULT_LINE_COLOR,
  DEFAULT_AREA_COLOR,
  DEFAULT_MARKER_COLOR,
  DEFAULT_GRID_COLOR,
  DEFAULT_GRID_TEXT_COLOR,
  DEFAULT_TIME_FORMAT,
  DEFAULT_INTERACTION_LINE_COLOR
} from './defaults';
import { CurveType, curveTypeMapping } from '../shared/chart.interface';

export type ScaleType = ScalePoint<string> | ScaleLinear<number, number> | ScaleTime<number, number>;

export type DataType = string | number | Date;

export type FormatType = (v: number | Date | string | { valueOf(): number }) => string;

export { CurveType, curveTypeMapping };

export interface LineChartScaleType {
  type?: 'linear' | 'time' | 'point';
  min?: number | 'auto' | Date;
  max?: number | 'auto' | Date;
}

export class LineChartScaleProperties implements LineChartScaleType {
  type?: 'linear' | 'time' | 'point';
  min?: number | 'auto' | Date;
  max?: number | 'auto' | Date;

  constructor(o: LineChartScaleType = {}) {
    this.type = o.type;
    this.min = o.min;
    this.max = o.max;
  }
}

export interface GridType {
  enable?: boolean;
  color?: string;
  size?: number;
  dashed?: boolean;
  opacity?: number;
  text?: boolean;
  textSize?: number;
  textColor?: string;
  fontFamily?: string;
  tickValues?: string[] | number[] | Date[];
  tickNumber?: number;
  tickPadding?: number;
  tickFormat?: string | ((v: number | Date) => string);
  tickTextAnchor?: 'middle' | 'start' | 'end';
  values?: DataType[];
}

export class GridProperties implements GridType {
  enable?: boolean;
  color?: string;
  size?: number;
  dashed?: boolean;
  opacity?: number;
  text?: boolean;
  textSize?: number;
  textColor?: string;
  fontFamily?: string;
  tickValues?: string[] | number[] | Date[];
  tickNumber?: number;
  tickPadding?: number;
  tickFormat?: string | ((v: number | Date) => string);
  tickTextAnchor?: 'middle' | 'start' | 'end';
  values?: DataType[];

  constructor(o: GridType = {}) {
    this.enable = typeof o.enable !== 'undefined' ? o.enable : true;
    this.color = o.color || DEFAULT_GRID_COLOR;
    this.size = o.size || 2;
    this.dashed = typeof o.dashed !== 'undefined' ? o.dashed : true;
    this.opacity = o.opacity || 1;
    this.text = typeof o.text !== 'undefined' ? o.text : true;
    this.textSize = o.textSize || 11;
    this.textColor = o.textColor || DEFAULT_GRID_TEXT_COLOR;
    this.fontFamily = o.fontFamily || 'sans-serif';
    this.tickValues = o.tickValues || null;
    this.tickNumber = o.tickNumber || null;
    this.tickPadding = o.tickPadding || 20;
    this.tickFormat = o.tickFormat;
    this.tickTextAnchor = o.tickTextAnchor || 'middle';
    this.values = o.values || null;
  }

  setDefaultFormat(data: LineChartData[], axis: 'x' | 'y'): GridProperties {
    if (!this.tickFormat && data && data.length) {
      const values = getAxisValues(data, axis);
      const type = detectValuesType(values);
      this.tickFormat = !type ? null : type === 'time' ? timeFormat(DEFAULT_TIME_FORMAT) : '~s';
    }

    return this;
  }
}

export type LineChartEventType = 'click' | 'mouseenter' | 'mousemove' | 'mouseleave';

export abstract class LineChartEvent {
  abstract readonly type: LineChartEventType;
}

export class LineChartEventClick extends LineChartEvent {
  constructor(
    public readonly type: LineChartEventType = 'click',
    public readonly x: { id: string | number, color: string, value: DataType }[] = [],
    public readonly y: { id: string | number, color: string, value: DataType }[] = []
  ) {
    super();
  }
}

export class LineChartEventMouseMove extends LineChartEventClick {
  constructor(
    public readonly type: LineChartEventType = 'click',
    public readonly x: { id: string | number, color: string, value: DataType }[] = [],
    public readonly y: { id: string | number, color: string, value: DataType }[] = [],
    public readonly mouseX: number = null,
    public readonly mouseY: number = null
  ) {
    super();
  }
}

export class LineChartEventMouseLeave extends LineChartEventMouseMove { }
export class LineChartEventMouseEnter extends LineChartEventMouseMove { }

export interface InteractionType {
  enable?: boolean;
  tooltip?: boolean;
  axisLine?: boolean;
  axisLineColor?: string;
  axisLineSize?: number;
  tickMarker?: boolean;
  tickMarkerSize?: number;
  xFormat?: FormatType;
  yFormat?: FormatType;
}

export class InteractionProperties {
  enable?: boolean;
  tooltip?: boolean;
  axisLine?: boolean;
  axisLineColor?: string;
  axisLineSize?: number;
  tickMarker?: boolean;
  tickMarkerSize?: number;
  xFormat?: FormatType;
  yFormat?: FormatType;

  constructor(o: InteractionType = {}) {
    this.enable = typeof o.enable !== 'undefined' ? o.enable : true;
    this.tooltip = typeof o.tooltip !== 'undefined' ? o.tooltip : true;
    this.axisLine = typeof o.axisLine !== 'undefined' ? o.axisLine : true;
    this.axisLineColor = o.axisLineColor || DEFAULT_INTERACTION_LINE_COLOR;
    this.axisLineSize = o.axisLineSize || 10;
    this.tickMarker = typeof o.tickMarker !== 'undefined' ? o.tickMarker : true;
    this.tickMarkerSize = o.tickMarkerSize || 10;
    this.xFormat = o.xFormat || null;
    this.yFormat = o.yFormat || null;
  }
}

export interface LineChartDataType {
  data: { x: DataType; y: DataType }[];
  id?: string;
  color?: string;
  lineSize?: number;
  opacity?: number;
  markers?: boolean;
  markerColor?: string;
  markerSize?: number;
  area?: boolean;
  areaColor?: string;
  areaOpacity?: number;
  curve?: CurveType;
}

export class LineChartData implements LineChartDataType {
  data: { x: DataType; y: DataType }[];
  id: string;
  color?: string;
  opacity?: number;
  lineSize?: number;
  markers?: boolean;
  markerColor?: string;
  markerSize?: number;
  area?: boolean;
  areaColor?: string;
  areaOpacity?: number;
  curve?: CurveType;

  constructor(o: LineChartDataType) {
    this.data = o.data;
    this.id = o.id;
    this.color = o.color || DEFAULT_LINE_COLOR;
    this.opacity = typeof o.opacity !== 'undefined' ? o.opacity : 1;
    this.lineSize = typeof o.lineSize !== 'undefined' ? o.lineSize : 2;
    this.markers = typeof o.markers !== 'undefined' ? o.markers : true;
    this.markerColor = o.markerColor || DEFAULT_MARKER_COLOR;
    this.markerSize = o.markerSize || 6;
    this.area = typeof o.area !== 'undefined' ? o.area : false;
    this.areaColor = o.areaColor || DEFAULT_AREA_COLOR;
    this.areaOpacity = typeof o.areaOpacity !== 'undefined' ? o.areaOpacity : .6;
    this.curve = o.curve || 'linear';
  }
}

export interface LineChartType {
  width?: number;
  height?: number;
  margin?: { top: number, right: number, bottom: number, left: number };
  xScale?: LineChartScaleProperties;
  yScale?: LineChartScaleProperties;
  xGrid?: GridProperties;
  yGrid?: GridProperties;
  transitions?: boolean;
  transitionDuration?: number;
  initialTransition?: boolean;
  legend?: boolean;
  legendPosition?: 'top' | 'top-right' | 'top-left' | 'right' | 'bottom' | 'bottom-right' | 'bottom-left' | 'left';
  legendMargin?: { top: number, right: number, bottom: number, left: number };
  interaction?: InteractionProperties;
}

export class LineChartProperties {
  width?: number;
  height?: number;
  margin?: { top: number, right: number, bottom: number, left: number };
  xScale?: LineChartScaleProperties;
  yScale?: LineChartScaleProperties;
  xGrid?: GridProperties;
  yGrid?: GridProperties;
  transitions?: boolean;
  transitionDuration?: number;
  initialTransition?: boolean;
  legend?: boolean;
  legendPosition?: 'top' | 'top-right' | 'top-left' | 'right' | 'bottom' | 'bottom-right' | 'bottom-left' | 'left';
  legendMargin?: { top: number, right: number, bottom: number, left: number };
  interaction?: InteractionProperties;

  constructor(o: LineChartType = {}) {
    this.width = o.width || null;
    this.height = o.height || null;
    this.margin = o.margin || { top: 20, right: 20, bottom: 30, left: 50 };
    this.xScale = o.xScale || new LineChartScaleProperties();
    this.yScale = o.yScale || new LineChartScaleProperties();
    this.xGrid = o.xGrid || new GridProperties();
    this.yGrid = o.yGrid || new GridProperties();
    this.transitions = typeof o.transitions !== 'undefined' ? o.transitions : true;
    this.transitionDuration = typeof o.transitionDuration !== 'undefined' ? o.transitionDuration : 400;
    this.initialTransition = typeof o.initialTransition !== 'undefined' ? o.initialTransition : true;
    this.legend = typeof o.legend !== 'undefined' ? o.legend : false;
    this.legendPosition = o.legendPosition || 'bottom-left';
    this.legendMargin = o.legendMargin || { top: 0, right: 0, bottom: 5, left: 5 };
    this.interaction = o.interaction && o.interaction instanceof InteractionProperties
      ? o.interaction : new InteractionProperties(o.interaction);
  }
}

export function getScale(
  o: LineChartProperties,
  data: LineChartData[],
  axis: 'x' | 'y',
  width: number,
  height: number
): ScaleType {
  const scale = axis === 'x' ? o.xScale : o.yScale;
  const values = getAxisValues(data, axis);
  const type = detectValuesType(values);

  let [smin, smax] = [scale.min, scale.max];

  if (!smin && smin !== 0 || smin === 'auto') {
    if (type === 'linear') {
      smin = min(values as number[]);
    }
    if (type === 'time') {
      smin = min(values as Date[]);
    }
  }

  if (!smax || smax === 'auto') {
    if (type === 'linear') {
      smax = max(values as number[]);
    }
    if (type === 'time') {
      smax = max(values as Date[]);
    }
  }

  if (axis === 'x' && !o.xGrid.tickFormat) {
    if (!o.xGrid.tickFormat) {
      o.xGrid = o.xGrid.setDefaultFormat(data, axis);
    }
    if (o.xGrid.tickNumber && !o.xGrid.tickValues) {
      const [tmax, tmin] = type === 'time' ? [(smax as Date).getTime(), (smin as Date).getTime()] : [smax, smin];
      const tval = ((tmax as any) - (tmin as any)) / (o.xGrid.tickNumber - 1);
      const tickValues = range(smin as any, (tmax as any) + tval, tval);
      o.xGrid.tickValues = type === 'time' ? tickValues.map(x => new Date(x)) : tickValues;
    }
  } else if (axis === 'y') {
    if (!o.yGrid.tickFormat) {
      o.yGrid = o.yGrid.setDefaultFormat(data, axis);
    }
    if (o.yGrid.tickNumber && !o.yGrid.tickValues) {
      const [tmax, tmin] = type === 'time' ? [(smax as Date).getTime(), (smin as Date).getTime()] : [smax, smin];
      const tval = ((tmax as any) - (tmin as any)) / (o.yGrid.tickNumber - 1);
      const tickValues = range(smin as any, (tmax as any) + tval, tval);
      o.yGrid.tickValues = type === 'time' ? tickValues.map(x => new Date(x)) : tickValues;
    }
  }

  switch (type) {
    case 'linear': {
      return scaleLinear().range(axis === 'x' ? [0, width] : [height, 0]).domain([smin as number, smax as number]);
    }
    case 'time': {
      return scaleTime().range(axis === 'x' ? [0, width] : [height, 0]).domain([smin as Date, smax as Date]);
    }
    case 'point': {
      return scalePoint().range([0, axis === 'x' ? width : height]).domain(values as string[]);
    }
  }
}

export function getLine(x: ScaleType, y: ScaleType, curve: CurveType): Line<[number, number]> {
  return line().x((d: any) => x(d.x)).y((d: any) => y(d.y)).curve(curveTypeMapping[curve]);
}

export function getArea(x: ScaleType, y: ScaleType, curve: CurveType, height: number): Area<[number, number]> {
  return area().x((d: any) => x(d.x)).y0(height).y1((d: any) => y(d.y)).curve(curveTypeMapping[curve]);
}

export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export function getFormattedValue(value: DataType, f?: FormatType): string {
  const formatter = getValueFormat(value, f);
  return formatter(value);
}

export function getValueFormat(value: DataType, f?: FormatType): FormatType {
  if (f) { return f; }
  const type = value instanceof Date ? 'date' : typeof value as 'string' | 'number';

  switch (type) {
    case 'string':
      return (v: string) => v;
    case 'number':
      return format('~s');
    case 'date':
      return timeFormat('%B %d, %Y');
  }
}

function getAxisValues(data: LineChartData[], axis: 'x' | 'y'): DataType[] {
  return data.reduce((acc, curr) => {
    return acc.concat(curr.data.map(val => val[axis]));
  }, []);
}

function detectValuesType(values: DataType[]): 'linear' | 'time' | 'point' {
  if (!values || !values.length) {
    return null;
  }
  if (values[0] instanceof Date) {
    return 'time';
  }
  if (typeof values[0] === 'number') {
    return 'linear';
  }
  if (typeof values[0] === 'string') {
    return 'point';
  }

  throw new Error(`could not detect axis values type`);
}
