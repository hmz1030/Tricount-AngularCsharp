import { Routes } from '@angular/router';

//import { HomeComponent } from '../components/home/home.component';
import { TricountsComponent } from '../components/Tricounts/tricounts.component';
import { CounterComponent } from '../components/counter/counter.component';
import { FetchDataComponent } from '../components/fetch-data/fetch-data.component';
import { LoginComponent } from '../components/Login/login.component';

export const appRoutes: Routes = [
    { path: '', component: LoginComponent, pathMatch: 'full' },
    { path : 'Login',component : LoginComponent},
    {path: 'tricounts', component: TricountsComponent},

    { path: 'counter', component: CounterComponent },
    { path: 'fetch-data', component: FetchDataComponent },
    { path: '**', redirectTo: '' }
];
