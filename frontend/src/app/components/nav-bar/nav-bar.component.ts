import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DrawerService } from '../../services/drawer.service';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule
    ],
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
    @Input() title: string = '';
    @Input() backUrl?: string;
    @Input() hideMenu: boolean = false;

    constructor(
        private drawerService: DrawerService,
        private router: Router
    ) {}

    openDrawer(): void {
        this.drawerService.open();
    }

    goBack(): void {
        if (this.backUrl) {
            this.router.navigate([this.backUrl]);
        }
    }
}