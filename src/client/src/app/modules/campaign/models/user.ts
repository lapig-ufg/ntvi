export interface User {
  id?: number;
  name: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  geeKey?: string;
  typeUser?: string;
  createdAt?: Date;
  updatedAt?: Date;
  terms?: boolean;
  picture?: string;
  active?: boolean;
  organizationId?: number;
}
