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
import { TricountService } from '../../services/tricount.service';
import { ResetDataBaseService } from '../../services/resetdatabase.service';
import { ConfirmResetDialogComponent } from '../resetdatabase/confirm-reset-dialog.component';
import { ThemeService } from 'src/app/services/theme.service';
import { BalanceService } from 'src/app/services/balance.service';

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
     error: string | null = null;

    constructor(
        private drawerService: DrawerService,
        private authService: AuthenticationService,
        private tricountService: TricountService,
        private balanceService: BalanceService,
        private resetDb: ResetDataBaseService,
        private router: Router,
        private dialog: MatDialog,
        public themeService: ThemeService
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
        this.tricountService.clearCache();
        this.balanceService.clearcash();
        this.authService.clearcash();
        this.router.navigate(['/login']);
    }

    openResetPopup(): void {
        const dialogRef = this.dialog.open(ConfirmResetDialogComponent, {
            width: '400px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.resetDb.resetDataBase().subscribe({
                    next: () => {
                        this.logout();
                    },
                    error: (err) => {
                        console.error('Erreur lors du reset:', err);
                        this.error = 'Erreur lors du reset de la base de données';
                    }
                });
            }
        });
    }

    toggleTheme(){
        this.themeService.toggleTheme();
    }
}