import {
    Component,
    NgZone,
    AfterViewInit,
    Output,
    Input,
    EventEmitter,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
} from '@angular/core';

import {View, Feature, Map} from 'ol';
import {defaults as defaultInteractions} from 'ol/interaction';
import {boundingExtent} from 'ol/extent';
import {Coordinate} from 'ol/coordinate';
import {toLonLat, transformExtent} from 'ol/proj';
import {defaults as DefaultControls} from 'ol/control';
import * as proj4x from 'proj4';

const proj4 = (proj4x as any).default;
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
import {Point as OPoint} from 'ol/geom';
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
    @Input() minZoom = 4 as number;
    @Input() maxZoom = 18 as number;
    @Input() points = [] as any[];
    @Input() mapId = 'map' as string;
    @Input() height = '345px' as string;
    @Input() showBaseMapGoogle = true as boolean;
    @Input() showBaseMapsEsri = false as boolean;
    @Input() showFullscreen = true as boolean;
    @Input() dragPan = true as boolean;
    @Input() extent: Extent;
    @Input() mouseWheelZoom = false as boolean;
    @Input() imgUrl = null as string;

    view: View;
    projection: Projection;
    Map: Map;
    ext: any;
    features: Feature[] = [];
    layerPoints: any = {};
    @Output() mapReady = new EventEmitter<Map>();

    constructor(
        private zone: NgZone,
        private cd: ChangeDetectorRef,
    ) {
    }

    ngAfterViewInit(): void {
        if (!this.Map) {
            this.zone.runOutsideAngular(() => this.initMap());
        }
        setTimeout(() => this.mapReady.emit(this.Map));
    }

    private initMap(): void {
        this.ext = [-304.038676, -74.719954, 314.008199, 85.717737];

        if (this.extent && this.extent.hasOwnProperty('length')) {
            if (this.extent.length > 0) {
                this.ext = this.extent;
            }
        }

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
        this.projection.setExtent(this.ext);
        this.view = new View({
            center: this.center,
            zoom: this.zoom,
            maxZoom: this.maxZoom,
            minZoom: this.minZoom,
            resolution: 2,
            maxResolution: 2,
            projection: this.projection,
        });
        const baseMapGoogle = new OlTileLayer({
            source: new OlXYZ({
                url: 'https://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            }),
        });
        const baseMapsEsri = new TileLayer({
            source: new XYZ({
                url:
                    'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            }),
        });

        if (this.showFullscreen) controls.push(new FullScreen());
        if (this.showBaseMapGoogle) layers.push(baseMapGoogle);
        if (this.showBaseMapsEsri) layers.push(baseMapsEsri);
        this.Map = new Map({
            interactions: defaultInteractions({
                altShiftDragRotate: false,
                pinchRotate: false,
                dragPan: this.dragPan,
                mouseWheelZoom: this.mouseWheelZoom,
            }),
            layers: layers,
            target: this.mapId,
            view: this.view,
            controls: DefaultControls().extend(controls),
        });
        if (this.imgUrl) {
            this.addImage();
        }
        if (this.hasVales(this.points)) {
            this.addPoints();
        }
    }

    hasVales(array) {
        let values = 0;
        for (const item of array) {
            values++;
        }
        return (values > 0 ? true : false);
    }

    addImage() {
        const projection = new Projection({
            code: 'EPSG:4326',
            units: 'pixels',
            extent: this.ext,
        });
        const layerImage = new ImageLayer({
            source: new Static({
                url: this.imgUrl,
                projection: projection,
                imageExtent: this.ext,
            }),
        });
        this.Map.addLayer(layerImage);
    }

    addPoints() {
        const self = this;
        let source = null as VectorSource;
        self.features = [];
        this.points.forEach(function (item) {
            self.features.push(new Feature(new OPoint(item)));
        });
        source = new VectorSource({
            features: self.features,
        });
        const style = new Style({
            image: new Circle({
                radius: 2,
                fill: new Fill({color: '#b30059'}),
            }),
        });
        this.layerPoints = new VectorLayer({
            source: source,
            style: style,
        });

        const ext = source.getExtent();
        this.Map.getView().fit(ext, {duration: 1500});
        this.Map.addLayer(this.layerPoints);
        // if (this.points.length > 1) {
        //     const ext = source.getExtent();
        //     this.Map.getView().fit(ext, {duration: 1500});
        // }
    }
}
