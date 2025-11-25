import { Routes } from '@angular/router';

//import { HomeComponent } from '../components/home/home.component';
import { TricountsComponent } from '../components/Tricounts/tricounts.component';
import { CounterComponent } from '../components/counter/counter.component';
import { FetchDataComponent } from '../components/fetch-data/fetch-data.component';

export const appRoutes: Routes = [
    { path: '', component: TricountsComponent, pathMatch: 'full' },
    { path: 'counter', component: CounterComponent },
    { path: 'fetch-data', component: FetchDataComponent },
    { path: '**', redirectTo: '' }
];
