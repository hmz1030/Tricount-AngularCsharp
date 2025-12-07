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

@Component({
    selector: 'app-tricounts',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './balance.component.html',
    styleUrls: ['./balance.component.css']
})

export class BalanceComponent implements OnInit {
    tricount?: Tricount;
    error?: string;
    balances?: UserBalance[];

    constructor(
        private tricountService: TricountService,
        private authService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog
    ) { };


    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        // charger le user stocke dans authService session storage

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
                console.log("Found Tricount : ", this.tricount)
            },
            error: (err) => {
                console.error('Error loading tricount:', err);
                this.router.navigate(['/restricted']);
            }
        });

        this.tricountService.getTricountBalance(id).subscribe({
            next: (userBalance) => {
                this.balances = userBalance;
            }
        })
    }

    goBack(): void {
        this.router.navigate(['/tricount/']);
    }

}