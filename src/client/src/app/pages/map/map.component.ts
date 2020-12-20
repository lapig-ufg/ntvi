import { Component,
  NgZone,
  AfterViewInit,
  Output,
  Input,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import {View, Feature, Map} from 'ol';
import { defaults as defaultInteractions } from 'ol/interaction';
import { Coordinate } from 'ol/coordinate';
import {defaults as DefaultControls} from 'ol/control';
import * as proj4x from 'proj4';
const  proj4 = (proj4x as any).default;
import VectorLayer from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import {register} from 'ol/proj/proj4';
import {get as GetProjection} from 'ol/proj';
import {Extent} from 'ol/extent';
import VectorSource from 'ol/source/Vector';
import {Circle, Style} from 'ol/style';
import OlTileLayer from 'ol/layer/Tile';
import OlXYZ from 'ol/source/XYZ';
import Fill from 'ol/style/Fill';
import { Point as OPoint} from 'ol/geom';
import { Point } from '../campaign/models/point';
import FullScreen from 'ol/control/FullScreen';
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';

@Component({
  selector: 'ngx-ol-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit {

  @Input() center: Coordinate;
  @Input() zoom = 3 as number;
  @Input() minZoom =  4 as number;
  @Input() maxZoom = 18 as number;
  @Input() points = [] as Point[];
  @Input() mapId = 'map' as string;
  @Input() height = '345px' as string;
  @Input() showBaseMapGoogle = true as boolean;
  @Input() showBaseMapsEnsri = false as boolean;
  @Input() showFullscreen = true as boolean;
  @Input() enableZoomMouse = false as boolean;
  @Input() extent = [-304.038676, -74.719954, 314.008199, 85.717737] as Extent;
  @Input() imgUrl = null as string;

  view: View;
  projection: Projection;
  Map: Map;
  features = [] as Feature[];
  @Output() mapReady = new EventEmitter<Map>();

  constructor(
    private zone: NgZone,
    private cd: ChangeDetectorRef,
  ) { }

  ngAfterViewInit(): void {
    if (!this.Map) {
      this.zone.runOutsideAngular(() => this.initMap());
    }
    setTimeout(() => this.mapReady.emit(this.Map));
  }
  private initMap(): void {
    const controls = [];
    const layers = [];
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
      maxZoom: this.maxZoom,
      minZoom: this.minZoom,
      projection: this.projection,
    });
    const baseMapGoogle = new OlTileLayer({
      source: new OlXYZ({
        url: 'https://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      }),
    });
    const baseMapsEnsri =   new TileLayer({
      source: new XYZ({
        url:
          'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      }),
    });

    if (this.showFullscreen) controls.push(new FullScreen());
    if (this.showBaseMapGoogle) layers.push(baseMapGoogle);
    if (this.showBaseMapsEnsri) layers.push(baseMapsEnsri);
    this.Map = new Map({
      interactions: defaultInteractions({
        altShiftDragRotate: false,
        pinchRotate: false,
        mouseWheelZoom: this.enableZoomMouse,
      }),
      layers: layers,
      target: this.mapId,
      view: this.view,
      controls: DefaultControls().extend(controls),
    });
    if ( this.points.length > 0) {
      this.addPoints();
    }
    if (this.imgUrl) {
      this.addImage();
    }
  }
  addImage() {
    const projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: this.extent,
    });

    const layerImage = new ImageLayer({
      source: new Static({
        url: this.imgUrl,
        projection: projection,
        imageExtent: this.extent,
      }),
    });
    this.Map.addLayer(layerImage);
  }
  addPoints() {
    const self = this;
    let layerPoints = null as VectorLayer;
    let source = null as VectorSource;
    if ( this.points.length > 0) {
      this.points.forEach(function (item) {
        self.features.push(new Feature(new OPoint([parseInt(item.longitude, 0), parseInt(item.latitude, 0)])));
      });
      source = new VectorSource({
        features: self.features,
      });
      const style = new Style({
        image:  new Circle({
          radius: 3,
          fill: new Fill({color: 'red'}),
        }),
      });
      layerPoints =  new VectorLayer({
        source: source,
        style: style,
      });
      this.Map.addLayer(layerPoints);
      if ( this.points.length > 1) {
        const extent = source.getExtent();
        this.Map.getView().fit(extent, {duration: 1500});
      }
    }
  }
}
