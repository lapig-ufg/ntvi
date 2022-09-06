import {Component, Input, AfterViewInit, OnInit} from '@angular/core';
import {NbDialogRef} from '@nebular/theme';
import {DatePipe} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'ngx-best-images',
    templateUrl: './best-images.component.html',
    styleUrls: ['./best-images.component.scss'],
})
export class BestImagesComponent{

    @Input() title: string;
    @Input() imagesPlanet;
    @Input() imagesSentinel;

    constructor(
        protected ref: NbDialogRef<BestImagesComponent>,
        private datePipe: DatePipe,
        public translate: TranslateService) {
    }

    cancel() {
        this.ref.close(false);
    }

    remove(remove) {
        this.ref.close(remove);
    }

    formatDate(date) {
        return this.datePipe.transform(date, this.translate.instant('campaign_result_date_format'))
    }
}
