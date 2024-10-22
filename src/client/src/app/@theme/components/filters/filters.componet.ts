import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NbWindowRef } from '@nebular/theme';
import {FilterService} from '../../../modules/campaign/service/filter.service';

@Component({
    template: `
        <div class="container-filter">
            <form fullWidth [formGroup]="form" (ngSubmit)="onSubmit()">
                <nb-tabset fullWidth>
                    <nb-tab tabTitle="Ponto">
                        <div class="form-group">
                            <input
                                type="number"
                                nbInput
                                formControlName="pointId"
                                fullWidth
                                shape="rectangle"
                                placeholder="Informe o número do ponto ..."
                            />
                        </div>
                        <button nbButton status="warning" hero type="submit">
                            Buscar Ponto
                        </button>
                    </nb-tab>

                    <nb-tab tabTitle="Filtros">
                        <nb-card>
                            <nb-card-header>Biomas</nb-card-header>
                            <nb-card-body>
                                <nb-select formControlName="selectedBiome" fullWidth>
                                    <nb-option value="1">Biome 1</nb-option>
                                    <nb-option value="2">Biome 2</nb-option>
                                </nb-select>
                            </nb-card-body>
                        </nb-card>

                        <nb-card>
                            <nb-card-header>Classes</nb-card-header>
                            <nb-card-body>
                                <nb-select formControlName="selectedClass" fullWidth>
                                    <nb-option value="1">Class 1</nb-option>
                                    <nb-option value="2">Class 2</nb-option>
                                </nb-select>
                            </nb-card-body>
                        </nb-card>

                        <nb-card>
                            <nb-card-header>Estados</nb-card-header>
                            <nb-card-body>
                                <nb-select formControlName="selectedState" fullWidth>
                                    <nb-option value="1">State 1</nb-option>
                                    <nb-option value="2">State 2</nb-option>
                                </nb-select>
                            </nb-card-body>
                        </nb-card>
                    </nb-tab>
                </nb-tabset>
            </form>
        </div>
    `,
})
export class FiltersFormComponent {
    form: FormGroup;

    constructor(private fb: FormBuilder, public windowRef: NbWindowRef, private filterService: FilterService) {
        // Inicializando o formulário com os campos para filtros
        this.form = fb.group({
            pointId: null,
            selectedBiome: null,
            selectedClass: null,
            selectedState: null,
        });
    }

    // Submissão do formulário, fechando a janela com os dados
    onSubmit() {
        if (this.form.valid) {
           this.filterService.updateFilterData(this.form.value);
            this.windowRef.close();
        }
    }
    close() {
        this.windowRef.close();
    }
}
