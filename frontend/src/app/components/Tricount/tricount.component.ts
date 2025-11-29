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

    refresh(): void{
    }
    edit(): void{
    }
    delete(): void{
    }
    
}