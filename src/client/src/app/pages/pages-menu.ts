import { NbMenuItem } from '@nebular/theme';

const grantMenu = function (roles) {
  let currentUser;
  let menuGranted;
  currentUser = JSON.parse(localStorage.getItem('user'));
  const roleDefault = 'DEFAULT';

  menuGranted = !roles.includes((currentUser === undefined || currentUser === null) ? roleDefault : currentUser.role);
  return menuGranted;
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
    icon: 'book-open-outline',
    hidden: grantMenu(['ROOT', 'ADMIN', 'USER', 'DEFAULT']),
    link: '/pages/campaign/public',
  },
  {
    title: 'Organizations',
    icon: 'home-outline',
    link: '/pages/organization/index',
    hidden: grantMenu(['ROOT']),
  },
  {
    title: 'Classes',
    icon: 'list-outline',
    link: '/pages/use-class/index',
    hidden: grantMenu(['ROOT']),
  },
  {
    title: 'Satellites',
    icon: 'globe-2-outline',
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
