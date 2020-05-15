export interface ProgressBarSettings {
  color?: 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'indigo' | 'purple' | 'pink';
  transition?: boolean;
  transitionDuration?: number;
  width?: string;
  height?: string;
}

export const defaultProgressBarSettings: ProgressBarSettings = {
  color: 'blue',
  transition: true,
  transitionDuration: 400,
  width: '100%',
  height: '24px'
};
