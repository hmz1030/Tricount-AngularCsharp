import { Component, CSP_NONCE, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Tricount } from "src/app/models/Tricount";
import { AuthenticationService } from "src/app/services/authentication.service";
import { TricountService } from "src/app/services/tricount.service";
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from "@angular/common";
import { UserBalance } from "src/app/models/UserBalance";
import { MatDialog } from "@angular/material/dialog";
import { BalanceService } from "src/app/services/balance.service";
import { NavBarComponent } from '../nav-bar/nav-bar.component';


@Component({
    selector: 'app-tricounts',
    standalone: true,
    imports: [CommonModule, MatIconModule, NavBarComponent],
    templateUrl: './balance.component.html',
    styleUrls: ['./balance.component.css']
})

export class BalanceComponent implements OnInit {
    tricountid?: number;
    tricount?: Tricount;
    error?: string;
    balances?: UserBalance[] = [];
    backUrl!: string;

    constructor(
        private tricountService: TricountService,
        private balanceService: BalanceService,
        private authService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog
    ) { };


    ngOnInit(): void {
        this.tricountid = Number(this.route.snapshot.paramMap.get('id'));
        this.backUrl = `/tricount/${this.tricountid}`;
        
        // Récupérer le tricount depuis le cache
        this.tricount = this.tricountService.tricounts.find(t => t.id === this.tricountid);
        
        // Si pas en cache (accès direct URL), charger les tricounts
        if (!this.tricount) {
            this.tricountService.getMyTricounts().subscribe({
                next: tricounts => {
                    this.tricount = tricounts.find(t => t.id === this.tricountid);
                    this.loadBalances();
                }
            });
        } else {
            this.loadBalances();
        }
    }
    
    private loadBalances(): void {
        this.balanceService.getTricountBalance(this.tricountid!).subscribe({
            next: balances => {
                this.balances = balances;
                this.matchUserNames();
                console.log("balance", this.balances);
            }
        });
    }

    matchUserNames(): void {
        if (this.balances && this.tricount?.participants) {
            this.balances.forEach(balance => {
                const user = this.tricount?.participants.find(u => u.id === balance.user);
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
        this.balanceService.clearcash();
        if (this.tricountid) {
            // Recharger le tricount pour avoir les participants à jour
            this.tricountService.getMyTricounts(true).subscribe({
                next: tricounts => {
                    this.tricount = tricounts.find(t => t.id === this.tricountid);
                    
                    // Puis recharger les balances
                    this.balanceService.getTricountBalance(this.tricountid!, true).subscribe({
                        next: balances => {
                            this.balances = balances;
                            this.matchUserNames();
                            console.log("balances", this.balances);
                        }
                    });
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