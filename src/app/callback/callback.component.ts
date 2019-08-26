import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {

  message: string;

  constructor(
    private auth: AuthService,
    private router: Router) {
  }

  async ngOnInit() {
    try {
      const desiredPath = await this.auth.handleAuthentication();
      await this.router.navigateByUrl(desiredPath);
    } catch (error) {
      await this.router.navigateByUrl('/');
    }
  }
}
