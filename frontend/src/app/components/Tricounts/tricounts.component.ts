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
    user?: User;
    loading = false;
    error: string | null = null;
    userName?: string;
    userEmail?: string;

    //état du panneau lateral
    isSidePanelOpen = false;
   

    constructor(
        private tricountService: TricountService, 
        private authService : AuthenticationService,
        private resetDb : ResetDataBaseService,
        private router: Router,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.loadTricounts();
        this.getUserData();
    }

    
    toggleSidePanel(): void {
        this.isSidePanelOpen = !this.isSidePanelOpen;
    }

    closeSidePanel(): void{
        this.isSidePanelOpen = false;
    }

    loadTricounts(): void {
        this.loading = true;
        this.error = null;

        this.tricountService.getMyTricounts().subscribe({
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

    getUserData(): void {
        this.authService.getUserData().subscribe({
            next: u => {
                this.user = u;
                this.userName = u.full_name;
                this.userEmail = u.email;
            },
            error: err => {
                console.error(err);
                this.error = 'User non connecté';
            }
        })
    }

    onAddTricount(): void {
        console.log("TODO: ouvrir écran de add tricount")
    }

    home(): void {
        this.closeSidePanel();
        this.router.navigate(['/tricounts']);
    }

    logout(): void {
        this.authService.logout();
        this.closeSidePanel();
        this.router.navigate(['/login']);
    }

    viewTricount(id : number): void {
        this.router.navigate(['/tricount',id]);
    }

    openResetPopup(): void {
        const dialogRef = this.dialog.open(ConfirmResetDialogComponent, {
            width: '400px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result === true) {
                this.resetDb.resetDataBase();
                this.logout();
            }
        });
    }
}