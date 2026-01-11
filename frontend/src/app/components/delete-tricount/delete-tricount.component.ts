import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthenticationService } from "src/app/services/authentication.service";
import { TricountService } from "src/app/services/tricount.service";

@Component({
    selector: 'app-tricounts',
    standalone: true,
    imports: [MatDialogModule, CommonModule],
    templateUrl: './delete-tricount.component.html',
    styleUrl: './delete-tricount.component.css'
})

export class DeleteTricountComponent{}