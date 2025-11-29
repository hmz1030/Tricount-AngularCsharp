import { Routes } from '@angular/router';

//import { HomeComponent } from '../components/home/home.component';
import { TricountsComponent } from '../components/Tricounts/tricounts.component';
import { LoginComponent } from '../components/Login/login.component';
import { TricountComponent } from '../components/Tricount/tricount.component';
export const appRoutes: Routes = [
    { path: '', component: LoginComponent, pathMatch: 'full' },
    { path : 'login',component : LoginComponent},
    {path: 'tricounts', component: TricountsComponent},
    { path: '', redirectTo: 'tricounts', pathMatch: 'full' },
    {path: 'tricount/:id', component: TricountComponent}
];
