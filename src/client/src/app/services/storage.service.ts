import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { CanActivate, Router } from '@angular/router';
import { NbAuthService } from '@nebular/auth';
import { tap } from 'rxjs/operators';

@Injectable()
export class StorageService {
  constructor(private storage: StorageMap) {
  }
}
