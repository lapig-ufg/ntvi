import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FilterService {
    private filterDataSubject = new BehaviorSubject<any>(null); // Inicialmente null

    filterData$ = this.filterDataSubject.asObservable();

    updateFilterData(data: any) {
        this.filterDataSubject.next(data);
    }
}
