import { Organization } from '../../organization/model/organization';
export interface User {
  id: number;
  name: string;
  email: string;
  city: string;
  state: string;
  country: string;
  geeKey: string;
  password: string;
  confirmPassword: string;
  typeUser?: string;
  picture: string;
  organization: Organization;
}
