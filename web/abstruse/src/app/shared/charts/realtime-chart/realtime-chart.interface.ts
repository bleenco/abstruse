import { Colors } from '../../models/color';
import { CurveType, curveTypeMapping } from '../shared/chart.interface';

export { CurveType, curveTypeMapping };

export interface RealtimeChartData {
  date: Date;
  value: number;
}

export interface RealtimeChartLineSettings {
  color?: string;
  opacity?: number;
  lineWidth?: number;
  area?: boolean;
  areaColor?: string;
  areaOpacity?: number;
  curve?: CurveType;
}

interface RealtimeChartGridSettings {
  enable?: boolean;
  color?: string;
  size?: number;
  dashed?: boolean;
  opacity?: number;
  ticks?: boolean;
  tickNumber?: number;
  tickPadding?: number;
  tickFontSize?: number;
  tickFontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  tickFontColor?: string;
  tickFontFamily?: string;
  tickFontAnchor?: 'start' | 'middle' | 'end';
}

export interface RealtimeChartXGridSettings extends RealtimeChartGridSettings {
  tickFormat?: string;
}

export interface RealtimeChartYGridSettings extends RealtimeChartGridSettings {
  min?: number | 'auto';
  max?: number | 'auto';
  tickValues?: string[];
  tickFormat?: string | ((v: string | number) => string);
}

export interface RealtimeChartSettings {
  width?: number;
  height?: number;
  margin?: { top?: number, right?: number, bottom?: number, left?: number };
  colors?: string[];
  timeFormat?: string;
  lines?: RealtimeChartLineSettings[];
  xGrid?: RealtimeChartXGridSettings;
  yGrid?: RealtimeChartYGridSettings;
  timeSlots?: number;
  loadingMessage?: string;
}

export const defaultRealtimeChartSettings: RealtimeChartSettings = {
  margin: { top: 25, right: 25, bottom: 25, left: 25 },
  colors: Colors,
  lines: [],
  xGrid: {
    enable: true,
    color: '#e9e9e9',
    size: 2,
    dashed: true,
    opacity: .5,
    ticks: true,
    tickFormat: '%H:%M:%S',
    tickPadding: 10,
    tickFontColor: '#6B6C6F',
    tickFontWeight: 'normal',
    tickFontSize: 10,
    tickFontFamily: 'sans-serif',
    tickFontAnchor: 'middle'
  },
  yGrid: {
    enable: true,
    color: '#e9e9e9',
    size: 2,
    dashed: true,
    opacity: .5,
    min: 'auto',
    max: 'auto',
    ticks: true,
    tickFormat: '~s',
    tickPadding: 10,
    tickFontColor: '#6B6C6F',
    tickFontWeight: 'normal',
    tickFontSize: 10,
    tickFontFamily: 'sans-serif',
    tickFontAnchor: 'middle'
  },
  timeSlots: 40,
  loadingMessage: 'Initializing, please wait...'
};
