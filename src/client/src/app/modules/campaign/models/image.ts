import {Satellite} from '../../satellite/model/satellite';

export interface Image {
  id?: number;
  date: Date;
  url: string;
  satelliteId: number;
  satellite: Satellite;
}
