import {Satellite} from '../../satellite/model/satellite';

export interface Composition {
  id?: number;
  colors: string;
  satelliteId: number;
  campaignId?: number;
  satellite: Satellite;
}
