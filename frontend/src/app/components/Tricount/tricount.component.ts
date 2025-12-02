import { Component, CSP_NONCE, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Tricount } from "src/app/models/Tricount";
import { AuthenticationService } from "src/app/services/authentication.service";
import { TricountService } from "src/app/services/tricount.service";
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from "@angular/common";
import { UserBalance } from "src/app/models/UserBalance";

@Component({
    selector: 'app-tricounts',
    standalone: true,
        imports: [CommonModule, MatIconModule],
    templateUrl: './tricount.component.html',
    styleUrls : ['./tricount.component.css']
})

export class TricountComponent implements OnInit{
    tricount?: Tricount;
    userid?: number;
    error?: string;
    userBalance?: UserBalance;
    total: number = 0;
    mytotal: number = 0;
    constructor(
        private tricountService : TricountService,
        private authService : AuthenticationService,
        private router: Router,
        private route : ActivatedRoute
    ){};


    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.getUserData();
        this.tricountService.getMyTricounts().subscribe({
            next: (tricounts) => {
                this.tricount = tricounts.find(t => t.id == id);
                this.calculateTotal();
                console.log("Found Tricound : ",this.tricount)
            },
            error: (err) => {
                console.error('Error loading tricount:', err);
            }
        })

        this.tricountService.getTricountBalance(id).subscribe({
            next: (usersBalance) => {
                this.userBalance = usersBalance.find(ub => ub.user == this.userid);
                console.log("found balance:",this.userBalance);
            }
        })
    }

    goBack(): void{
        this.router.navigate(['/tricounts']);
    }
    calculateTotal(){
        if(this.tricount){
            for(let op of this.tricount?.operations){
                this.total += op.amount || 0
            }
        }
    }

    getUserData(): void {
        this.authService.getUserData().subscribe({
            next: u => {
                this.userid = u.id;
            },
            error: err => {
                console.error(err);
                this.error = 'User non connecté';
            }
        })
    }


    refresh(): void{
    }
    edit(): void{
    }
    delete(): void{
    }
    viewBalance(): void {
    console.log('View balance clicked');
    }

    addOperation(): void {
        console.log('Add operation clicked');
    }
    
}