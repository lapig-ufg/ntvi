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
import {Coordinate} from 'ol/coordinate';
import {defaults as DefaultControls} from 'ol/control';
import * as proj4x from 'proj4';

const proj4 = (proj4x as any).default;
import VectorLayer from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import {register} from 'ol/proj/proj4';
import {transform, fromLonLat, get as GetProjection} from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import {Circle, Icon, Style} from 'ol/style';
import OlTileLayer from 'ol/layer/Tile';
import OlXYZ from 'ol/source/XYZ';
import Fill from 'ol/style/Fill';
import {Point, Point as OPoint} from 'ol/geom';
import FullScreen from 'ol/control/FullScreen';
import TileLayer from 'ol/layer/Tile';
import {cross} from './icon';
@Component({
    selector: 'ngx-ol-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit {

    @Input() center: Coordinate = [0, 0];
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
    @Input() extent = [-304.038676, -74.719954, 314.008199, 85.717737] as any;
    @Input() mouseWheelZoom = false as boolean;
    @Input() period: 'WET' | 'DRY'; // Novo input para definir o período
    @Input() year: number; // Novo input para definir o ano
    @Input() showLandsat = false as boolean ; // Flag para exibir ou não a camada Landsat

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
    ) {}

    ngAfterViewInit(): void {
        if (!this.Map) {
            this.zone.runOutsideAngular(() => this.initMap());
        }
        setTimeout(() => this.mapReady.emit(this.Map));
    }

    private initMap(): void {
        // Carregar projeção EPSG:4326
        proj4.defs([
            ['EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'],
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

         // Cria as camadas dinamicamente

        const controls = [];
        if (this.showFullscreen) controls.push(new FullScreen());

        this.Map = new Map({
            interactions: defaultInteractions({
                altShiftDragRotate: false,
                pinchRotate: false,
                dragPan: this.dragPan,
                mouseWheelZoom: this.mouseWheelZoom,
            }),
            target: this.mapId,
            view: this.view,
            controls: DefaultControls().extend(controls),
        });
        const layers = this.createLayers();
        if (Array.isArray(layers) && layers.length > 0) {
            layers.forEach(layer =>  this.Map.addLayer(layer));
        }
        if (this.hasValues(this.points)) {
            this.addPoints();
        }
    }

    private createLayers(): TileLayer[] {
        const layers = [];

        // Carregar a camada Landsat apenas se showLandsat for true
        if (this.showLandsat) {
            const landsatLayerUrl = `https://tm{1-5}.lapig.iesa.ufg.br/api/layers/landsat/{x}/{y}/{z}?period=${this.period}&year=${this.year}`;

            // Adiciona a camada Landsat dinâmica
            const landsatLayer = new TileLayer({
                source: new OlXYZ({
                    url: landsatLayerUrl,
                    attributions: `Landsat - ${this.year} (${this.period})`,
                    attributionsCollapsible: false,
                }),
            });
            layers.push(landsatLayer);
            this.addMarker(this.center[1], this.center[0], this.Map);
        }

        if (this.showBaseMapGoogle) {
            layers.push(new OlTileLayer({
                source: new OlXYZ({
                    url: 'https://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                }),
            }));
        }

        if (this.showBaseMapsEsri) {
            layers.push(new TileLayer({
                source: new OlXYZ({
                    url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                }),
            }));
        }

        return layers;
    }

    hasValues(array: any[]): boolean {
        return array.length > 0;
    }

    addPoints(): void {
        const source = new VectorSource({
            features: this.points.map(point => new Feature(new OPoint(point))),
        });

        const style = new Style({
            image: new Circle({
                radius: 2,
                fill: new Fill({ color: '#b30059' }),
            }),
        });

        this.layerPoints = new VectorLayer({
            source: source,
            style: style,
        });

        const ext = source.getExtent();
        this.Map.getView().fit(ext, { duration: 1500 });
        this.Map.addLayer(this.layerPoints);
    }
    private addMarker(lat: number, lon: number, map: Map): void {
        const projectedCoordinate = transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
        const iconFeature = new Feature({
            geometry: new Point(fromLonLat([projectedCoordinate[0], projectedCoordinate[1]])),
        });
        const iconStyle = new Style({
            image: new Icon({
                anchor: [0.5, 0.5],
                src: cross,
                scale: 1,
            }),
        });

        iconFeature.setStyle(iconStyle);
        const vectorSource = new VectorSource({
            features: [iconFeature],
        });
        const vectorLayer = new VectorLayer({
            source: vectorSource,
            visible: true,
        });
        vectorLayer.setZIndex(10000);
        map.addLayer(vectorLayer);
    }
}
