export interface SetupWizard {
  step: number;
  steps: WizardStep[];
}

export interface WizardStep {
  step: number;
  route: string;
  backEnabled: boolean;
  skipEnabled: boolean;
  nextEnabled: boolean;
}

export const defaultWizardConfig = (): SetupWizard => {
  return {
    step: 1,
    steps: [
      { step: 1, route: 'security', backEnabled: false, skipEnabled: true, nextEnabled: false },
      { step: 2, route: 'database', backEnabled: true, skipEnabled: false, nextEnabled: false },
      { step: 3, route: 'user', backEnabled: true, skipEnabled: false, nextEnabled: false },
      { step: 4, route: 'etcd', backEnabled: true, skipEnabled: true, nextEnabled: true }
    ]
  };
};
