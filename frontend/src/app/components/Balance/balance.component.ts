import { Component, CSP_NONCE, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Tricount } from "src/app/models/Tricount";
import { AuthenticationService } from "src/app/services/authentication.service";
import { TricountService } from "src/app/services/tricount.service";
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from "@angular/common";
import { UserBalance } from "src/app/models/UserBalance";
import { MatDialog } from "@angular/material/dialog";
import { User } from "src/app/models/user";

@Component({
    selector: 'app-tricounts',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './balance.component.html',
    styleUrls: ['./balance.component.css']
})

export class BalanceComponent implements OnInit {
    tricountid?: number;
    users: User[] = [];
    error?: string;
    balances?: UserBalance[] = [];

    constructor(
        private tricountService: TricountService,
        private authService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog
    ) { };


    ngOnInit(): void {
    this.tricountid = Number(this.route.snapshot.paramMap.get('id'));
    
    // Load balances first
    this.tricountService.getTricountBalance(this.tricountid).subscribe({
        next: (userBalance) => {
            this.balances = userBalance;
            
            // Then load users
            this.authService.getAllUsers().subscribe({
                next: (userslist) => {
                    this.users = userslist;
                    
                    // NOW match names - both are loaded!
                    this.matchUserNames();
                    
                    console.log("Balances with names:", this.balances);
                },
                error: (err) => {
                    console.error("Error loading users:", err);
                }
            });
        },
        error: (err) => {
            console.error("Error loading balances:", err);
        }
    });
}

    matchUserNames(): void {
    if (this.balances && this.users) {
        this.balances.forEach(balance => {
            const user = this.users.find(u => u.id === balance.user);
            if (user) {
                balance.name = user.full_name; 
            }
        });
        console.log("Balances with names:", this.balances);
    }
}

    goBack(): void {
       this.router.navigate(['/tricount', this.tricountid]);
    }
    refresh(): void {
        if (this.tricountid) {
            this.tricountService.getTricountBalance(this.tricountid).subscribe({
                next: (userBalance) => {
                    this.balances = userBalance;
                    console.log("Balances refreshed:", this.balances);
                },
                error: (err) => {
                    console.error('Error refreshing balances:', err);
                }
            });
        }
    }
    getBarWidth(balance: number): number {
    if (balance === 0) return 0;
    
    const maxBalance = Math.max(...(this.balances?.map(b => Math.abs(b.balance || 0)) || [0]));
    
    return (Math.abs(balance) / maxBalance) * 100;
}


}