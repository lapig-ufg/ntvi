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
    link: '/modules/campaign/index',
  },
  {
    title: 'Public campaigns',
    icon: 'book-open-outline',
    hidden: grantMenu(['ROOT', 'ADMIN', 'USER', 'DEFAULT']),
    link: '/modules/campaign/public',
  },
  {
    title: 'Organizations',
    icon: 'home-outline',
    link: '/modules/organization/index',
    hidden: grantMenu(['ROOT']),
  },
  {
    title: 'Classes',
    icon: 'list-outline',
    link: '/modules/use-class/index',
    hidden: grantMenu(['ROOT']),
  },
  {
    title: 'Satellites',
    icon: 'globe-2-outline',
    link: '/modules/satellite/index',
    hidden: grantMenu(['ROOT']),
  },
  {
    title: 'Admin Users',
    icon: 'people-outline',
    link: '/modules/users/admin',
    hidden: grantMenu(['ROOT']),
  },
];
