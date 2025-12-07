import { Routes } from '@angular/router';

import { TricountsComponent } from '../components/Tricounts/tricounts.component';
import { LoginComponent } from '../components/Login/login.component';
import { SignupComponent } from '../components/signup/signup.component';
import { TricountComponent } from '../components/Tricount/tricount.component';
import { RestrictedComponent } from '../components/restricted/restricted.component';
import { UnknownComponent } from '../components/unknown/unknown.component';
import{AddOperationComponent} from '../components/add-operation/add-operation.component';
import { AuthGuard } from '../services/auth.guard';
import { BalanceComponent } from '../components/Balance/balance.component';

export const appRoutes: Routes = [
    { path: '', component: LoginComponent, pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'tricounts', component: TricountsComponent, canActivate: [AuthGuard] },
    { path: 'tricount/:id', component: TricountComponent, canActivate: [AuthGuard] },
    { path: 'balance/:id', component: BalanceComponent, canActivate: [AuthGuard] },
    { path: 'tricount/:id/add-operation', component: AddOperationComponent, canActivate: [AuthGuard]},
    { path: 'restricted', component: RestrictedComponent },
    { path: '**', component: UnknownComponent }
];
