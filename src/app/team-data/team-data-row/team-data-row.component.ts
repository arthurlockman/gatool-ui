import {Component, Input, OnChanges} from '@angular/core';
import {Team} from '../../model/team';
import {StateService} from '../../state.service';
import {GaToolBackendService} from '../../gatool-backend.service';
import {Award} from '../../model/award';

@Component({
  selector: 'app-team-data-row',
  templateUrl: './team-data-row.component.html',
  styleUrls: ['./team-data-row.component.scss']
})
export class TeamDataRowComponent implements OnChanges {
  @Input() team: Team;
  public loadingTeamData = false;
  public teamAwards: Award[];

  constructor(public stateManager: StateService, public service: GaToolBackendService) { }

  ngOnChanges(): void {
    this.loadingTeamData = true;
    this.service.getTeamAwards(this.stateManager.getSelectedSeason(), this.team.teamNumber).subscribe(awards => {
      this.loadingTeamData = false;
      this.teamAwards = awards;
    }, err => {
      console.error(err);
      this.loadingTeamData = false;
    });
  }
}
