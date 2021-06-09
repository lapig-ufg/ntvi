import {Component, Input} from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {

  @Input() title: string;
  @Input() msg: string;
  @Input() status: string;

  constructor(protected ref: NbDialogRef<DialogComponent>) {
  }
  cancel() {
    this.ref.close(false);
  }

  remove(remove) {
    this.ref.close(remove);
  }
}
