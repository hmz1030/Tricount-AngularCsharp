import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Tricount } from "src/app/models/Tricount";
import { AuthenticationService } from "src/app/services/authentication.service";
import { TricountService } from "src/app/services/tricount.service";

@Component({
    selector: 'app-tricounts',
    standalone: true,
    templateUrl: './tricount.component.html',
    styleUrls : ['./tricount.component.css']
})

export class TricountComponent implements OnInit{
    tricount?: Tricount;
    constructor(
        private tricountService : TricountService,
        private authService : AuthenticationService,
        private router: Router,
    ){
    };


    ngOnInit(): void {
    }
    
}