import {Component} from '@angular/core';
import {NbWindowRef} from '@nebular/theme';

@Component({
    template: `
        <div class="container-filter">
            <nb-tabset fullWidth>
                <nb-tab tabTitle="Ponto">
                    <div class="form-group">
                        <input type="number" ngModel="" nbInput fullWidth shape="rectangle" placeholder="Informe o número do ponto ...">
                    </div>
                    <button nbButton status="warning" hero> buscar ponto </button>
                </nb-tab>
                <nb-tab tabTitle="Filtros">
                    <nb-card>
                        <nb-card-header>Biomas</nb-card-header>
                        <nb-card-body>
                            <nb-select fullWidth selected="1">
                                <nb-option value="1">Option 1</nb-option>
                                <nb-option value="2">Option 2</nb-option>
                            </nb-select>
                        </nb-card-body>
                    </nb-card>
                    <nb-card>
                        <nb-card-header>Classes</nb-card-header>
                        <nb-card-body>
                            <nb-select fullWidth selected="1">
                                <nb-option value="1">Option 1</nb-option>
                                <nb-option value="2">Option 2</nb-option>
                            </nb-select>
                        </nb-card-body>
                    </nb-card>
                    <nb-card>
                        <nb-card-header>Estados</nb-card-header>
                        <nb-card-body>
                            <nb-select fullWidth selected="1">
                                <nb-option value="1">Option 1</nb-option>
                                <nb-option value="2">Option 2</nb-option>
                            </nb-select>
                        </nb-card-body>
                    </nb-card>
                </nb-tab>
            </nb-tabset>
        </div>
    `,
    styleUrls: ['filters.component.scss'],
})
export class FiltersComponent {

    constructor(public windowRef: NbWindowRef) {
    }

    close() {
        this.windowRef.close();
    }
}
