import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Tricount } from "src/app/models/Tricount";
import { AuthenticationService } from "src/app/services/authentication.service";
import { TricountService } from "src/app/services/tricount.service";
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-tricounts',
    standalone: true,
        imports: [CommonModule, MatIconModule],
    templateUrl: './tricount.component.html',
    styleUrls : ['./tricount.component.css']
})

export class TricountComponent implements OnInit{
    tricount?: Tricount;
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

        this.tricountService.getMyTricounts().subscribe({
            next: (tricounts) => {
                this.tricount = tricounts.find(t => t.id == id);
                this.calculate();
                console.log("Found Tricound : ",this.tricount)
            },
            error: (err) => {
                console.error('Error loading tricount:', err);
            }
        })
    }

    goBack(): void{
        this.router.navigate(['/tricounts']);
    }
    calculate(){

        if(this.tricount){
            for(let op of this.tricount?.operations){
                this.total += op.amount || 0
                if (op.initiator_id == this.authService.currentUser?.id){
                    this.mytotal += op.amount || 0
                }
            }

        }
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