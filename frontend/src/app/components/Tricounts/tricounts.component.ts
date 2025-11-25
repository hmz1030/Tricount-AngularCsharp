import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { TricountService } from '../../services/tricount.service';
import { Tricount } from '../../models/Tricount';

@Component({
  selector: 'app-tricounts',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './tricounts.component.html',
})

export class TricountsComponent implements OnInit {
    tricounts: Tricount[] = [];
    loading = false;
    error: string | null = null;

    constructor(private tricountService: TricountService) {}

    ngOnInit(): void {
        this.loadTricounts();
    }

    loadTricounts(): void {
        this.loading = true;
        this.error = null;

        this.tricountService.getMyTricounts().subscribe({
            next: t => {
                this.tricounts = t;
                this.loading = false;
            },
            error: err => {
                console.error(err);
                this.error = 'Impossible de charger vos tricounts.';
                this.loading = false;
            }
        });
    }
}