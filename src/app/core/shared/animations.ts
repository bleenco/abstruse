import { trigger, state, style, transition, animate } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  state('in', style({ opacity: 1 })),
  transition(':enter', [
    style({ opacity: 0.1 }),
    animate(500)
  ])
]);
