import { UseClass } from '../../use-class/model/use-class';
import { Organization } from '../../organization/model/organization';
import { Composition } from './composition';
import { Image } from './image';
import { Point } from './point';
import { UsersOnCampaigns } from './usersOnCampaigns';

export interface Campaign {
  id?: number;
  name: string;
  description: string;
  numInspectors: number;
  typePeriod?: string;
  status?: string;
  initialDate?: Date;
  finalDate?: Date;
  publish?: boolean;
  organization?: Organization;
  classes?: UseClass[];
  compositions?: Composition[];
  points?: Point[];
  images?: Image[];
  usersOnCampaign?: UsersOnCampaigns[];
}
