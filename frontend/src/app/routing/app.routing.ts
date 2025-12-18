import { Routes } from '@angular/router';

import { TricountsComponent } from '../components/Tricounts/tricounts.component';
import { LoginComponent } from '../components/Login/login.component';
import { SignupComponent } from '../components/signup/signup.component';
import { TricountComponent } from '../components/Tricount/tricount.component';
import { RestrictedComponent } from '../components/restricted/restricted.component';
import { UnknownComponent } from '../components/unknown/unknown.component';
import{SaveOperationComponent} from '../components/saveoperation/save-operation.component';
import { AuthGuard } from '../services/auth.guard';
import { BalanceComponent } from '../components/Balance/balance.component';
import { SaveTricountComponent } from '../components/savetricount/savetricount.component';      

export const appRoutes: Routes = [
    { path: '', component: LoginComponent, pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'tricounts', component: TricountsComponent, canActivate: [AuthGuard] },
    { path: 'tricount/:id', component: TricountComponent, canActivate: [AuthGuard] },
    { path: 'tricount/:id/balance', component: BalanceComponent, canActivate: [AuthGuard] },
    { path: 'tricount/:id/operation/:operationId/edit', component: SaveOperationComponent, canActivate: [AuthGuard]},
    { path: 'tricount/:id/operation/add', component: SaveOperationComponent, canActivate: [AuthGuard]},
    { path: 'add-tricount', component: SaveTricountComponent, canActivate: [AuthGuard]},
    { path: 'edit-tricount/:id', component: SaveTricountComponent, canActivate:[AuthGuard]},
    { path: 'restricted', component: RestrictedComponent },
    { path: '**', component: UnknownComponent }
];
