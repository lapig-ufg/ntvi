import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'ngx-status-card',
    styleUrls: ['./status-card.component.scss'],
    template: `
        <nb-card [class]="name != 'none' ? 'btn-cursor' : ''" (click)="toggle()">
            <div class="icon-container">
                <div class="icon status-{{ type }}">
                    <ng-content></ng-content>
                </div>
            </div>

            <div *ngIf="title" class="details">
                <div *ngIf="title" class="title h5"> {{ title }}</div>
            </div>

            <div *ngIf="name == 'none'" class="icon-container" nbTooltip="Filtros dos pontos" nbTooltipStatus="primary">
                <div class="icon status-warning">
                    <nb-icon (click)="onFilter()" icon="funnel-outline"></nb-icon>
                </div>
            </div>
        </nb-card>
    `,
})
export class StatusCardComponent {
    @Input() name: string;
    @Input() title: any;
    @Input() type: string;
    @Input() subtitle: any;
    @Output() prev: EventEmitter<any> = new EventEmitter();
    @Output() next: EventEmitter<any> = new EventEmitter();
    @Output() filter: EventEmitter<any> = new EventEmitter();
    onFilter(){
        this.filter.emit(null);
    }
    toggle() {
        if (this.name === 'prev') {
            this.prev.emit(null);
        } else {
            this.next.emit(null);
        }
    }
}
