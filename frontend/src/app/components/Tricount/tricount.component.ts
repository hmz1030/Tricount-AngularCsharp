import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Tricount } from "src/app/models/Tricount";
import { AuthenticationService } from "src/app/services/authentication.service";
import { TricountService } from "src/app/services/tricount.service";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from "@angular/common";
import { UserBalance } from "src/app/models/UserBalance";
import { MatDialog } from "@angular/material/dialog";
import { DeleteTricountComponent } from "../delete-tricount/delete-tricount.component";
import { BalanceService } from "src/app/services/balance.service";
import { Operation } from "src/app/models/Operation";
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
    selector: 'app-tricounts',
    standalone: true,
    imports: 
    [   CommonModule, 
        MatIconModule,
        MatButtonModule,
        NavBarComponent
    ],
    templateUrl: './tricount.component.html',
    styleUrls: ['./tricount.component.css']
})

export class TricountComponent implements OnInit {
    tricount?: Tricount;
    userid?: number;
    error?: string;
    userBalance?: UserBalance;
    total: number = 0;
    mytotal: number = 0;
    canDelete: boolean = false;
    operations?: Operation[];
    backUrl = '/tricounts';
    isLoadingBalance: boolean = true;
    
    private tricountId!: number;
    
    constructor(
        private tricountService: TricountService,
        private balanceService: BalanceService,
        private authService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef
    ) { };


    ngOnInit(): void {
        this.tricountId = Number(this.route.snapshot.paramMap.get('id'));
        this.userid = this.authService.currentUser?.id;

        this.loadTricount();
        this.startCheckingBalance();
    }

    private loadTricount(): void {
        const cachedTricount = this.tricountService.tricounts.find(t => t.id == this.tricountId);

        if (cachedTricount) {
            this.tricount = cachedTricount;
            this.calculateTotal();
            this.canDelete = this.tricount?.creator == this.userid;
            this.initatorsName();
            
            this.loadBalance();
        } else {
            this.tricountService.getMyTricounts().subscribe({
                next: (tricounts) => {
                    this.tricount = tricounts.find(t => t.id == this.tricountId);

                    if (!this.tricount) {
                        this.router.navigate(['/restricted']);
                        return;
                    }

                    this.calculateTotal();
                    this.canDelete = this.tricount?.creator == this.userid;
                    this.initatorsName();
                    this.loadBalance();
                },
                error: (err) => {
                    this.router.navigate(['/restricted']);
                }
            });
        }
    }

    private loadBalance(): void {
        const cachedBalance = this.balanceService.getUserBalanceForTricount(this.userid!, this.tricountId);
        
        if (cachedBalance) {
            this.userBalance = cachedBalance;
            this.isLoadingBalance = false;
        } else if (this.balanceService.isLoadingInBackground(this.tricountId)) {
            this.isLoadingBalance = true;
        } else {
            this.isLoadingBalance = true;
            this.balanceService.getTricountBalance(this.tricountId).subscribe({
                next: () => {
                    this.userBalance = this.balanceService.getUserBalanceForTricount(this.userid!, this.tricountId);
                    this.isLoadingBalance = false;
                }
            });
        }
    }

    private startCheckingBalance(): void {
        const checkOnce = () => {
            if (this.isLoadingBalance) {
                const balance = this.balanceService.getUserBalanceForTricount(this.userid!, this.tricountId);
                
                if (balance) {
                    this.userBalance = balance;
                    this.isLoadingBalance = false;
                    
                    const updatedTricount = this.tricountService.tricounts.find(t => t.id === this.tricountId);
                    if (updatedTricount) {
                        this.tricount = updatedTricount;
                        this.calculateTotal();
                        this.initatorsName();
                    }
                    
                    this.cdr.detectChanges();
                } else {
                    setTimeout(checkOnce, 200);
                }
            }
        };
        
        setTimeout(checkOnce, 200);
    }

    initatorsName(): void{
        this.tricount?.operations.forEach(operation=>{
            if (!operation.initiatorName) {
                operation.initiatorName = this.tricount?.participants.find(u => u.id == operation.initiator)?.full_name;
            }
        })
    }

    goBack(): void {
        this.router.navigate(['/tricounts']);
    }

    calculateTotal() {
        //re initialiser le total
        this.total = 0;
        if (this.tricount) {
            for (let op of this.tricount?.operations) {
                this.total += op.amount || 0
            }
        }
    }


    refresh(): void {
        this.isLoadingBalance = true;
        this.authService.clearcash();
        
        this.tricountService.getMyTricounts(true).subscribe({
            next: (tricounts) => {
                this.tricount = tricounts.find(t => t.id == this.tricountId);

                if (!this.tricount) {
                    this.router.navigate(['/restricted']);
                    return;
                }

                this.calculateTotal();
                this.canDelete = this.tricount?.creator == this.userid;
                this.initatorsName();

                this.balanceService.getTricountBalance(this.tricountId, true).subscribe({
                    next: () => {
                        this.userBalance = this.balanceService.getUserBalanceForTricount(this.userid!, this.tricountId);
                        this.isLoadingBalance = false;
                    }
                });
            },
            error: () => {
                this.router.navigate(['/restricted']);
            }
        });
    }
    
    edit(): void {
        this.router.navigate(['/edit-tricount', this.tricount?.id]);
    }
    
    delete(): void {
        if(!this.canDelete){
            return
        }
        const dialogRef = this.dialog.open(DeleteTricountComponent,{
            width:'500px'
        })

        dialogRef.afterClosed().subscribe(result => {
            if(result == true) {
                this.tricountService.deleteTricount(this.tricount!.id).subscribe({
                    next : () =>{
                        
                        this.tricountService.clearCache();
                        this.router.navigate(['/tricounts']);
                        
                    },
                    error: (err) => {
                        console.error('Erreur lors du delete tricount:', err)
                    }
                })
                
            }
        });
        
    }

    viewBalance(): void {
        this.router.navigate(['tricount/' + this.tricount?.id + '/balance']);
    }

    addOperation(): void {
        this.router.navigate(['/tricount', this.tricount?.id, 'operation', 'add']);
    }



    editOperation(operationId: number | undefined): void {
        if (!operationId) {
            console.error('Operation ID is undefined');
            return;
        }
        this.router.navigate(['/tricount', this.tricount?.id, 'operation', operationId, 'edit']);
    }

}