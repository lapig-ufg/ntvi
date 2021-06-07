import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormsModule as ngFormsModule} from '@angular/forms';
import { UsersRoutingModule, routedComponents } from './users-routing.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbAlertModule,
  NbCheckboxModule, NbDatepickerModule, NbIconModule,
  NbInputModule, NbRadioModule, NbSelectModule,
  NbUserModule, NbListModule,
} from '@nebular/theme';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    ...routedComponents,
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    ReactiveFormsModule,
    Ng2SmartTableModule,
    FormsModule,
    NbAlertModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbActionsModule,
    NbUserModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDatepickerModule,
    NbSelectModule,
    NbIconModule,
    ngFormsModule,
    NbListModule,
    NbEvaIconsModule,
    TranslateModule,
  ],
})
export class UsersModule { }
