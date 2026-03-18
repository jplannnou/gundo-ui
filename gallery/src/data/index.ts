import type { ComponentGroup } from './types';
import { layoutGroup } from './groups/layout';
import { navigationGroup } from './groups/navigation';
import { formsGroup } from './groups/forms';
import { feedbackGroup } from './groups/feedback';
import { overlayGroup } from './groups/overlay';
import { dataDisplayGroup } from './groups/data-display';
import { commerceGroup } from './groups/commerce';
import { healthGroup } from './groups/health';
import { profileGroup } from './groups/profile';
import { chartsGroup } from './groups/charts';
import { motionGroup } from './groups/motion';

export type { ComponentDef, PropDef, ComponentGroup } from './types';

export const componentGroups: ComponentGroup[] = [
  { name: 'Layout', items: layoutGroup },
  { name: 'Navigation', items: navigationGroup },
  { name: 'Forms', items: formsGroup },
  { name: 'Feedback', items: feedbackGroup },
  { name: 'Overlay', items: overlayGroup },
  { name: 'Data Display', items: dataDisplayGroup },
  { name: 'Commerce', items: commerceGroup },
  { name: 'Health & Nutrition', items: healthGroup },
  { name: 'Profile & Contact', items: profileGroup },
  { name: 'Charts', items: chartsGroup },
  { name: 'Motion', items: motionGroup },
];
