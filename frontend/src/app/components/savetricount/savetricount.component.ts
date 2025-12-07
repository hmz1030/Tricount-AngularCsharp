import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";


import { SetFocusDirective } from "src/app/directives/setfocus.directive";

@Component({
    selector: 'app-save-tricount',
    standalone: true,
    imports: [//CommonModule,
        ReactiveFormsModule,
        //RouterModule,
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
export class SaveTricountComponent {


} 