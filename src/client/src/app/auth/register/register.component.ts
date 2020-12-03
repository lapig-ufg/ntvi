import { Component } from '@angular/core';
import { NbRegisterComponent} from '@nebular/auth';

@Component({
  selector: 'ngx-register',
  styleUrls: ['./register.component.scss'],
  templateUrl: './register.component.html',
})
export class RegisterComponent extends NbRegisterComponent {
}
