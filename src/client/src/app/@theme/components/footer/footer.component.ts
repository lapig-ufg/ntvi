import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
     <img class="partners" src="../../../assets/images/parceiros.png">
    </span>
  `,
})
export class FooterComponent {
}
