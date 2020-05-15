import { Colors } from '../../models/color';

export interface PieChartData {
  id: string;
  value: number;
  color?: string;
}

export interface PieChartSettings {
  width?: number;
  height?: number;
  margin?: { top?: number, right?: number, bottom?: number, left?: number };
  colors?: string[];
  innerRadius?: number;
  padAngle?: number;
  borderRadius?: number;
  textColor?: string;
  transitions?: boolean;
  transitionsDuration?: number;
  labels?: boolean;
}

export const defaultPieChartSettings: PieChartSettings = {
  margin: { top: 25, right: 25, bottom: 25, left: 25 },
  colors: Colors,
  innerRadius: 0.6,
  padAngle: 0.7,
  borderRadius: 4,
  textColor: '#fff',
  transitions: true,
  transitionsDuration: 400,
  labels: true
};
