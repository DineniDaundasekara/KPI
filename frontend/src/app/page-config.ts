export interface NavOption {
  label: string;
  path: string;
  title: string;
}

export const overallNavOptions: NavOption[] = [
  {
    label: 'Overall KPI Table',
    path: 'overall/current-month',
    title: 'Overall KPI — Current Month'
  }
];

export const platformNavOptions: NavOption[] = [
  {
    label: 'Service Fulfilment',
    path: 'platform/service-fulfilment',
    title: 'Platform KPI — Service Fulfilment'
  },
  {
    label: 'IP NW OP',
    path: 'platform/ip-nw-op',
    title: 'Platform KPI — IP NW OP'
  },
  {
    label: 'BB ANW',
    path: 'platform/bb-anw',
    title: 'Platform KPI — BB ANW'
  },
  {
    label: 'OTN OP',
    path: 'platform/otn-op',
    title: 'Platform KPI — OTN OP'
  },
  {
    label: 'TM Activity Plan',
    path: 'platform/tm-activity-plan',
    title: 'Platform KPI — TM Activity Plan'
  },
  {
    label: 'Routine MTNC',
    path: 'platform/routine-mtnc',
    title: 'Platform KPI — Routine MTNC'
  },
  {
    label: 'Tower MTCE Achievement',
    path: 'platform/tower-mtce-achievement',
    title: 'Platform KPI — Tower MTCE Achievement'
  }
];

export const adminNavOptions: NavOption[] = [
  {
    label: 'Admin Registration',
    path: 'admin/admin-registration',
    title: 'Admin — Admin Registration'
  },
  {
    label: 'User Registration',
    path: 'admin/user-registration',
    title: 'Admin — User Registration'
  },
  {
    label: 'Service Fulfilment',
    path: 'admin/service-fulfilment',
    title: 'Admin — Service Fulfilment'
  },
  {
    label: 'Region Management',
    path: 'admin/region-management',
    title: 'Admin — Region Management'
  },
  {
    label: 'IP NW OP',
    path: 'admin/ip-nw-op',
    title: 'Admin — IP NW OP'
  },
  {
    label: 'BB ANW',
    path: 'admin/bb-anw',
    title: 'Admin — BB ANW'
  },
  {
    label: 'OTN OP 1',
    path: 'admin/otn-op-1',
    title: 'Admin — OTN OP 1'
  },
  {
    label: 'OTN OP 2',
    path: 'admin/otn-op-2',
    title: 'Admin — OTN OP 2'
  },
  {
    label: 'Tower MTCE Achievement',
    path: 'admin/tower-mtce-achievement',
    title: 'Admin — Tower MTCE Achievement'
  },
  {
    label: 'TM Activity Plan',
    path: 'admin/tm-activity-plan',
    title: 'Admin — TM Activity Plan'
  },
  {
    label: 'Routine MTNC',
    path: 'admin/routine-mtnc',
    title: 'Admin — Routine MTNC'
  },
  {
    label: 'E-mail Service',
    path: 'admin/email-service',
    title: 'Admin — E-mail Service'
  },
  {
    label: 'Final Table',
    path: 'admin/final-table',
    title: 'Admin — Final Table'
  }
];

export const infoPages = [
  ...overallNavOptions,
  ...platformNavOptions,
  ...adminNavOptions
];

