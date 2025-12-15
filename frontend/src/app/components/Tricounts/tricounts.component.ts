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
import { User } from 'src/app/models/user';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmResetDialogComponent } from '../resetdatabase/confirm-reset-dialog.component';


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
        MatDialogModule
    ],
    templateUrl: './tricounts.component.html',
    styleUrls: ['./tricounts.component.css']
})

export class TricountsComponent implements OnInit {
    tricounts: Tricount[] = [];
    allUsers: User[] = [];
    loading = false;
    error: string | null = null;
    isSidePanelOpen = false;

    get currentUser() {
        return this.authService.currentUser;
    }

    constructor(
        private tricountService: TricountService,
        private authService: AuthenticationService,
        private resetDb: ResetDataBaseService,
        private router: Router,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.loadTricounts(false);
        console.log("tricounts:",this.tricounts)
        this.getAllUsers();
        console.log("Tricounts that are shown:",this.tricounts)
    }


    toggleSidePanel(): void {
        this.isSidePanelOpen = !this.isSidePanelOpen;
    }

    closeSidePanel(): void {
        this.isSidePanelOpen = false;
    }

    loadTricounts(refresh: boolean = false): void {
        this.loading = true;
        this.error = null;
        

        this.tricountService.getMyTricounts(refresh).subscribe({
            next: t => {
                this.tricounts = t;
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
        this.closeSidePanel();
        this.router.navigate(['/tricounts']);
    }

    logout(): void {
        this.authService.logout();
        this.closeSidePanel();
        this.tricountService.clearCache();
        this.router.navigate(['/login']);
    }

    viewTricount(id: number): void {
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

    getAllUsers(): void {
        this.authService.getAllUsers().subscribe({
            next: u => {
                this.allUsers = u;
            },
            error: (err) => {
                console.log(err);
            }
        });
    }

    getCreatorName(creatorId: number): string | undefined{
        const creator = this.allUsers.find(u => u.id === creatorId);
        return creator ? creator.full_name : "Unknown";
    } 
}