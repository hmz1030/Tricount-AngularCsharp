import { Component, CSP_NONCE, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Tricount } from "src/app/models/Tricount";
import { AuthenticationService } from "src/app/services/authentication.service";
import { TricountService } from "src/app/services/tricount.service";
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from "@angular/common";
import { UserBalance } from "src/app/models/UserBalance";
import { MatDialog } from "@angular/material/dialog";
import { DeleteTricountComponent } from "../delete-tricount/delete-tricount.component";
import { BalanceService } from "src/app/services/balance.service";

@Component({
    selector: 'app-tricounts',
    standalone: true,
    imports: [CommonModule, MatIconModule],
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
    constructor(
        private tricountService: TricountService,
        private balanceService: BalanceService,
        private authService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog
    ) { };


    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        // charger le user stocke dans authService session storage
        this.userid = this.authService.currentUser?.id;

        this.tricountService.getMyTricounts().subscribe({
            next: (tricounts) => {
                this.tricount = tricounts.find(t => t.id == id);


                // Vérifier si le tricount existe et si l'utilisateur y a accès
                if (!this.tricount) {
                    console.warn('Tricount not found or access denied');
                    this.router.navigate(['/restricted']);
                    return;
                }

                this.calculateTotal();
                this.tricount?.creator != this.userid
                console.log("Found Tricount : ", this.tricount)
            },
            error: (err) => {
                console.error('Error loading tricount:', err);
                this.router.navigate(['/restricted']);
            }
        });

        //recuperer les donner du balance du serveur si il sont pas deja la
        this.balanceService.getTricountBalance(this.tricount?.id!).subscribe()
        //recupere de la cash la balance du user
        this.userBalance = this.balanceService.getUserBalanceForTricount(this.userid!,this.tricount?.id!)
    }

    goBack(): void {
        this.router.navigate(['/tricounts']);
    }

    calculateTotal() {
        if (this.tricount) {
            for (let op of this.tricount?.operations) {
                this.total += op.amount || 0
            }
        }
    }


    refresh(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.tricountService.getMyTricounts(true).subscribe({
            next: (tricounts) => {
                    this.tricount = tricounts.find(t => t.id == id);


                    // Vérifier si le tricount existe et si l'utilisateur y a accès
                    if (!this.tricount) {
                        console.warn('Tricount not found or access denied');
                        this.router.navigate(['/restricted']);
                        return;
                    }

                    this.calculateTotal();
                    this.tricount?.creator != this.userid
                    console.log("Found Tricount : ", this.tricount)
                },
            error: (err) => {
                console.error('Error loading tricount:', err);
                this.router.navigate(['/restricted']);
            }
        });
        //recuperer les donner du balance du serveur si il sont pas deja la
        this.balanceService.getTricountBalance(this.tricount?.id!,true).subscribe()
        //recupere de la cash la balance du user
        this.userBalance = this.balanceService.getUserBalanceForTricount(this.userid!,this.tricount?.id!)    
    }
    
    edit(): void {
        this.router.navigate(['/edit-tricount', this.tricount?.id]);
    }
    
    delete(): void {
        if(this.tricount?.creator != this.userid){
            return
        }
        const dialogRef = this.dialog.open(DeleteTricountComponent,{width:'500px'})

        dialogRef.afterClosed().subscribe(result => {
            if(result == true) {
                this.tricountService.deleteTricount(this.tricount!.id).subscribe({
                    next : () =>{
                        //this.tricountService.updateTricountsStorage(this.tricount!.id);
                        
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
        this.router.navigate(['tricount/' + this.tricount?.id + '/add-operation']);
    }

}