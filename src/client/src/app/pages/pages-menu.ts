import { NbMenuItem } from '@nebular/theme';

const grantMenu = function (roles) {
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const roleDefault = 'DEFAULT';

  return !roles.includes((currentUser === undefined || currentUser === null) ? roleDefault : currentUser.role);
};

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Campaign',
    icon: 'map',
    home: true,
    hidden: grantMenu(['ROOT', 'ADMIN', 'USER', 'DEFAULT']),
    link: '/pages/campaign/index',
    // children: [
    //   {
    //     title: 'Register',
    //     link: '/pages/campaign',
    //   },
    // ],
  },
  {
    title: 'Organizations',
    icon: 'map',
    link: '/pages/organization/index',
    hidden: grantMenu(['ROOT']),
  },
  {
    title: 'Use Class',
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
];
