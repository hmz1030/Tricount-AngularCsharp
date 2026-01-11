import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { TricountService } from '../../services/tricount.service';
import { Tricount } from '../../models/Tricount';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ResetDataBaseService } from 'src/app/services/resetdatabase.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmResetDialogComponent } from '../resetdatabase/confirm-reset-dialog.component';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { BalanceService } from 'src/app/services/balance.service';
import { ThemeService } from 'src/app/services/theme.service';



@Component({
    selector: 'app-tricounts',
    standalone: true,
    imports: [
        CommonModule,
        NgClass,
        RouterLink,
        RouterLinkActive,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatCardModule,
        MatDialogModule,
        NavBarComponent
    ],
    templateUrl: './tricounts.component.html',
    styleUrls: ['./tricounts.component.css']
})

export class TricountsComponent implements OnInit {
    loading = false;
    error: string | null = null;

    get tricounts(): Tricount[] {
        return this.tricountService.tricounts;
    }

    get currentUser() {
        return this.authService.currentUser;
    }

    constructor(
        private tricountService: TricountService,
        private authService: AuthenticationService,
        private resetDb: ResetDataBaseService,
        private balanceService: BalanceService,
        private router: Router,
        private dialog: MatDialog,
        private themeService: ThemeService
    ) { }

    ngOnInit(): void {
        this.loadTricounts(false);
        console.log("tricounts:", this.tricounts)
        console.log("Tricounts that are shown:", this.tricounts)
    }


    loadTricounts(refresh: boolean = false): void {
        this.loading = true;
        this.error = null;

        if (refresh) {
            this.balanceService.clearcash();
        }

        this.tricountService.getMyTricounts(refresh).subscribe({
            next: () => {
                this.loading = false;
            },
            error: err => {
                console.error(err);
                this.error = 'Impossible de charger vos tricounts.';
                this.loading = false;
            }
        });
    }

    onAddTricount(): void {
        this.router.navigate(['/add-tricount']);
    }

    home(): void {
        this.router.navigate(['/tricounts']);
    }

    logout(): void {
        this.authService.logout();
        this.tricountService.clearCache();
        this.balanceService.clearcash();
        this.router.navigate(['/login']);
    }

    viewTricount(id: number): void {
        // Ne pas naviguer si le tricount est en cours de création (ID temporaire négatif)
        if (id < 0) {
            return;
        }
        this.router.navigate(['/tricount', id]);
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

    getCreatorName(tricountId: number): string | undefined {
        const tricount = this.tricounts.find(t => t.id === tricountId);
        if (!tricount) return "Unknown";
        
        const creator = tricount.participants.find(u => u.id === tricount.creator);
        return creator ? creator.full_name : "Unknown";
    }


    friendsCount(tricountId: number): number | undefined {
        const tricount = this.tricounts.find(t => t.id === tricountId);
        return Number(tricount?.participants.length) - 1;
    }
    toggleTheme(): void {
        this.themeService.toggleTheme();
    }
}