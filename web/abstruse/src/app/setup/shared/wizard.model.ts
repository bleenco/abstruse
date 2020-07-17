export interface SetupWizard {
  step: number;
  steps: WizardStep[];
}

export interface WizardStep {
  step: number;
  route: string;
  backEnabled: boolean;
  nextEnabled: boolean;
}

export const defaultWizardConfig = (): SetupWizard => {
  return {
    step: 1,
    steps: [
      { step: 1, route: 'security', backEnabled: false, nextEnabled: false },
      { step: 2, route: 'database', backEnabled: true, nextEnabled: false },
      { step: 3, route: 'etcd', backEnabled: true, nextEnabled: false },
      { step: 4, route: 'user', backEnabled: true, nextEnabled: false }
    ]
  };
};
