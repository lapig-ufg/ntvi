import { Component,
  OnInit,
  NgZone,
  AfterViewInit,
  Output,
  Input,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';

import {View, Feature, Map} from 'ol';
import {Coordinate} from 'ol/coordinate';
import { ScaleLine, defaults as DefaultControls} from 'ol/control';
import * as proj4x from 'proj4';
const  proj4 = (proj4x as any).default;
import VectorLayer from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import {register} from 'ol/proj/proj4';
import {get as GetProjection} from 'ol/proj';
import {Extent} from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import OSM, {ATTRIBUTION} from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import {Circle, Style} from 'ol/style';
import Fill from 'ol/style/Fill';
import { Point as OPoint} from 'ol/geom';
import { Point } from '../campaign/models/point';
import FullScreen from 'ol/control/FullScreen';

@Component({
  selector: 'ngx-ol-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {

  @Input() center: Coordinate;
  @Input() zoom: number;
  @Input() points = [] as Point[];
  view: View;
  projection: Projection;
  extent: Extent = [-304.038676, -74.719954, 314.008199, 85.717737];
  Map: Map;
  features = [] as Feature[];
  @Output() mapReady = new EventEmitter<Map>();

  constructor(private zone: NgZone, private cd: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    if (!this.Map) {
      this.zone.runOutsideAngular(() => this.initMap());
    }
    setTimeout(() => this.mapReady.emit(this.Map));
  }

  private initMap(): void {
    const self = this;
    proj4.defs([
      [
        'EPSG:4326',
        '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
      [
        'EPSG:4269',
        '+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees',
      ],
    ]);
    register(proj4);
    this.projection = GetProjection('EPSG:4326');
    this.projection.setExtent(this.extent);
    this.view = new View({
      center: this.center,
      zoom: this.zoom,
      maxZoom: 18,
      minZoom: 4,
      projection: this.projection,
    });
    let layerPoints = null as VectorLayer;
    let source = null as VectorSource;
    if ( this.points.length > 0) {
      this.points.forEach(function (item) {
        self.features.push(new Feature(new OPoint([parseInt(item.longitude, 0), parseInt(item.latitude, 0)])));
      });
      source = new VectorSource({
        features: self.features,
      });
      layerPoints =  new VectorLayer({
        source: source,
        style: new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({color: 'red'}),
          }),
        }),
      });
    }
    const baseLayer = new TileLayer({
      source: new OSM({}),
    });
    this.Map = new Map({
      layers: [
        baseLayer,
        layerPoints ? layerPoints : null,
      ],
      target: 'map',
      view: this.view,
      controls: DefaultControls().extend([
        new FullScreen(),
      ]),
    });
    if ( this.points.length > 0) {
      const extent = source.getExtent();
      this.Map.getView().fit(extent, {duration: 1500});
    }
  }

}
