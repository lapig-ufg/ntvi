import { NbMenuItem } from '@nebular/theme';

const grantMenu = function (roles) {
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const roleDefault = 'DEFAULT';

  return !roles.includes((currentUser === undefined || currentUser === null) ? roleDefault : currentUser.role);
};

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Campaigns',
    icon: 'map',
    home: true,
    hidden: grantMenu(['ROOT', 'ADMIN', 'USER', 'DEFAULT']),
    link: '/pages/campaign/index',
  },
  {
    title: 'Public campaigns',
    icon: 'map',
    hidden: grantMenu(['ROOT', 'ADMIN', 'USER', 'DEFAULT']),
    link: '/pages/campaign/public',
  },
  {
    title: 'Organizations',
    icon: 'map',
    link: '/pages/organization/index',
    hidden: grantMenu(['ROOT']),
  },
  {
    title: 'Classes',
    icon: 'map',
    link: '/pages/use-class/index',
    hidden: grantMenu(['ROOT']),
  },
  {
    title: 'Satellites',
    icon: 'map',
    link: '/pages/satellite/index',
    hidden: grantMenu(['ROOT']),
  },
  {
    title: 'Admin Users',
    icon: 'people-outline',
    link: '/pages/users/admin',
    hidden: grantMenu(['ROOT']),
  },
];
