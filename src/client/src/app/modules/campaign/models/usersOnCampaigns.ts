import { User } from './user';

export interface UsersOnCampaigns {
  userId: number;
  campaignId?: number;
  typeUserInCampaign: string;
  user: User;
}
