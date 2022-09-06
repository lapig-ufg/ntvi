import {AfterViewInit, Component, Input, NgZone, OnInit} from '@angular/core';
import * as L from 'leaflet';

@Component({
    selector: 'ngx-map-leaflet',
    templateUrl: './map-leaflet.component.html',
    styleUrls: ['./map-leaflet.component.scss']
})
export class MapLeafletComponent implements AfterViewInit, OnInit{

    public id;
    public map;
    public markerInMap;
    public tmsLayer;
    public marker;

    @Input() lon: number;
    @Input() lat: number;
    @Input() tmsUrl: string;
    @Input() zoom: number;
    @Input() bounds;
    @Input() type: string;

    ngOnInit(): void {
        console.log('first')
        this.id = 'map-' + Date.now();
    }

    ngAfterViewInit(): void {
        console.log('second', this.id)
        this.initMap()
    }

    private initMap(): void {
        this.map = L.map(this.id, {
            center: [this.lat, this.lon],
            zoomControl: true,
            dragging: false,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            zoom: this.zoom,
            minZoom: this.zoom,
            maxZoom: this.zoom + 2,
        });

        L.control.scale({ metric: true, imperial: false, position: 'topright' }).addTo(this.map);
        this.marker = L.marker([this.lat, this.lon], {
            icon: L.icon({
                iconUrl: '../../../../assets/images/marker.png',
                iconSize: [42, 42],
            }),
        });

        L.imageOverlay(this.tmsUrl, this.bounds).addTo(this.map);
        this.marker.addTo(this.map);

        this.markerInMap = true;

        const self = this;
        this.map.on('click', function() {
            if(self.markerInMap) {
                self.map.removeLayer(self.marker);
                self.markerInMap = false;
            } else {
                self.map.addLayer(self.marker);
                self.markerInMap = true;
            }
        });
    }


}
