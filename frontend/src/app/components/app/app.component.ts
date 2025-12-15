import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DrawerService } from '../../services/drawer.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ConfirmResetDialogComponent } from '../resetdatabase/confirm-reset-dialog.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
    @ViewChild('drawer') drawer!: MatSidenav;

    constructor(
        private drawerService: DrawerService,
        private authService: AuthenticationService,
        private router: Router,
        private dialog: MatDialog
    ) {}

    ngAfterViewInit(): void {
        this.drawerService.setSidenav(this.drawer);
    }

    get currentUser() {
        return this.authService.currentUser;
    }

    navigateTo(url: string): void {
        this.drawer.close();
        this.router.navigate([url]);
    }

    logout(): void {
        this.drawer.close();
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    openResetPopup(): void {
        this.drawer.close();
        this.dialog.open(ConfirmResetDialogComponent);
    }
}