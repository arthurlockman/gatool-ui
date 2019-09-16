import { Component, OnInit } from '@angular/core';
import { GaToolBackendService } from '../gatool-backend.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {

  constructor(public service: GaToolBackendService) { }

  ngOnInit() {
    this.service.getEventTeams('2019', 'MELEW').subscribe(teams => {
      console.log(teams);
    });
  }

}
