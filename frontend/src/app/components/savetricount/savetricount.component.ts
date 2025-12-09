import { Component, OnInit } from "@angular/core";
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
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
import { Tricount } from "src/app/models/Tricount";

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
    selectedParticipantIds: number[] = [];
    allUsers: User[] = [];
    currentUserId: number | undefined;
    error: string | null = null;
    frm!: FormGroup;
    ctlTitle!: FormControl;
    ctlDescription!: FormControl;

    constructor(
        private tricountService: TricountService,
        private authService: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder) {
        this.ctlTitle = this.fb.control('', [Validators.required, Validators.minLength(3)], [this.titleUsed()]);
        this.ctlDescription = this.fb.control('', [Validators.minLength(3)]);
        this.frm = this.fb.group({
            title: this.ctlTitle,
            description: this.ctlDescription
        });


    }
    ngOnInit(): void {
        this.currentUserId = this.authService.currentUser?.id;
        this.tricountId = Number(this.route.snapshot.paramMap.get('id')) || 0;
        this.authService.getAllUsers().subscribe(users => {
            this.allUsers = users;
        });
        if (this.tricountId == 0) {
            this.selectedParticipantIds = [this.currentUserId!];

        }
        else {
            const tricount = this.tricountService.tricounts.find(t => t.id == this.tricountId);
            if (tricount) {
                this.ctlTitle.setValue(tricount.title);
                this.ctlDescription.setValue(tricount.description || '');
                this.selectedParticipantIds = tricount.participants.map(p => p.id!);
            }

        }
    }
    get availableUsers(): User[] {
        return this.allUsers.filter(u => !this.selectedParticipantIds.includes(u.id!));
    }
    get selectedParticipants(): User[] {
        return this.allUsers.filter(u => this.selectedParticipantIds.includes(u.id!));
    }

    addParticipant(userId: number): void {
        if (!this.selectedParticipantIds.includes(userId)) {
            this.selectedParticipantIds.push(userId);
        }


    }
    removeParticipant(userId: number): void {
        const index = this.selectedParticipantIds.indexOf(userId);
        if (index > -1) {
            // splice -> remove tous les elements a partir d'index
            this.selectedParticipantIds.splice(index, 1)
        }

    }
    saveTricount(): void {
        const tricountToSave: Tricount = {
            id: this.tricountId,
            title: this.ctlTitle.value,
            description: this.ctlDescription.value,
            creator: this.currentUserId!,
            created_at: new Date().toISOString(),
            participants: [],
            operations: []
        };
        this.tricountService.saveTricount(tricountToSave, this.selectedParticipantIds)
            .subscribe({
                next: () => {
                    this.cancel();
                },
                error: (err) => {
                    this.error = 'Erreur lors de la sauvegarde du tricount';
                    console.error(err);
                }


            });


    }
    cancel(): void {
        this.router.navigate(['/tricounts']);
    }
    titleUsed(): AsyncValidatorFn {
        let timeout: NodeJS.Timeout;
        return (ctl: AbstractControl) => {
            clearTimeout(timeout);
            const title = ctl.value;
            return new Promise(resolve => {
                timeout = setTimeout(() => {
                    if (title.length === 0) {
                        resolve(null);
                    } else {
                        this!.tricountService.isTricountTitleAvailable(title).subscribe(available => {
                            resolve(available ? null : { emailUsed: true });
                            console.log("jss rentreyyy");
                        });
                    }
                }, 300);
            });
        };
    }

}