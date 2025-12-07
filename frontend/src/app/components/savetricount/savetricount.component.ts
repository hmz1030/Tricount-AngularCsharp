import { Component, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SetFocusDirective } from "src/app/directives/setfocus.directive";
import { AuthenticationService } from "src/app/services/authentication.service";
import { TricountService } from "src/app/services/tricount.service";
import { User } from "src/app/models/user";

@Component({
    selector: 'app-save-tricount',
    standalone: true,
    imports: [CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatSelectModule,
        MatDatepickerModule,
        MatCheckboxModule,
        MatIconModule,
        SetFocusDirective],
    templateUrl: './savetricount.component.html',
    styleUrls: ['./savetricount.component.css']
})
export class SaveTricountComponent implements OnInit {
    tricountId: number = 0;
    title: string = '';
    description: string = '';
    selectedParticipantIds: number[] = [];
    allUsers: User[] = [];
    currentUserId: number | undefined;
    constructor(
        private tricountService: TricountService,
        private authService: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder)
        {
            this.currentUserId = this.authService.currentUser?.id;

            
        }
        ngOnInit(): void {
            this.tricountId = Number(this.route.snapshot.paramMap.get('id')) || 0;
            this.authService.getAllUsers().subscribe(users => {
                this.allUsers = users;
            });
        }




} 