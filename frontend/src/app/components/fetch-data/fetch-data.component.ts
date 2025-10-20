import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Component, Inject} from '@angular/core';
import {BASE_URL} from 'src/main';

@Component({
    selector: 'app-fetch-data',
    templateUrl: './fetch-data.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class FetchDataComponent {
    public message?: string;

    constructor(http: HttpClient, @Inject(BASE_URL) baseUrl: string) {
        http.get<string>(baseUrl + 'rpc/ping').subscribe({
            next: result => {
                console.log(result);
                this.message = result;
            },
            error: error => console.error(error)
        });
    }
}
