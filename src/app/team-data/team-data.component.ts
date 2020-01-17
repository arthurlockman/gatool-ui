import { Component, OnInit } from '@angular/core';
import { GaToolBackendService } from '../gatool-backend.service';
import { StateService } from '../state.service';
import { TeamData } from '../model/team';

@Component({
  selector: 'app-team-data',
  templateUrl: './team-data.component.html',
  styleUrls: ['./team-data.component.scss']
})
export class TeamDataComponent implements OnInit {
  public selectedSeason: string;
  public selectedEvent: string;
  public fetchInProgress = false;
  public teams: TeamData[];

  constructor(public service: GaToolBackendService, public stateManager: StateService) { }

  ngOnInit() {
    this.selectedSeason = this.stateManager.getSelectedSeason();
    this.selectedEvent = this.stateManager.getSelectedEvent();
    if (!!this.selectedEvent && !!this.selectedSeason) {
      this.fetchInProgress = true;
      this.service.getEventTeams(this.selectedSeason, this.selectedEvent).subscribe(teams => {
        this.fetchInProgress = false;
        this.teams = this.expandSponsors(teams);
        this.teams = this.getAwards(teams);
        console.log(teams);
      }, err => {
        console.error(err);
        this.fetchInProgress = false;
      });
    }
  }

  expandSponsors(teams: TeamData[]) {
    let team: TeamData;
    let sponsorArray: string[];
    let topSponsorsArray: string[];
    let lastSponsor: string;
    let sponsorsRaw: string;
    let organizationArray: string[];
    // We need to split apart the sponsors because FIRST combines the sponsors and the school in nameFull
    for (team of teams) {
      team.cityState = team.city + ', ' + team.stateProv;
      team.cityStateSort = team.country + ':' + team.stateProv + ':' + team.city;
      sponsorsRaw = team.nameFull;
      if (team.schoolName) {
        team.organization = team.schoolName;
      }
      if (!team.organization) {
        sponsorArray = trimArray(team.nameFull.split('/'));
      } else {
        if (team.organization === sponsorsRaw) {
          sponsorArray[0] = sponsorsRaw;
        } else {
          sponsorsRaw = sponsorsRaw.slice(0, sponsorsRaw.length - team.organization.length).trim();
          sponsorsRaw = sponsorsRaw.slice(0, sponsorsRaw.length - 1).trim();
          sponsorArray = trimArray(sponsorsRaw.split('/'));
        }
      }

      organizationArray = trimArray(team.nameFull.split('/').pop().split('&'));

      if (!sponsorArray && !organizationArray && !team.organization) {
        team.organization = 'No organization in TIMS';
        team.sponsors = 'No sponsors in TIMS';
        topSponsorsArray[0] = team.sponsors;
      }
      if (sponsorArray.length === 1) {
        team.sponsors = sponsorArray[0];
        team.topSponsors = team.sponsors;
      } else {
        if (organizationArray.length > 1 && !team.organization) {
          sponsorArray.pop();
          sponsorArray.push(organizationArray.slice(0).shift());
        }
        topSponsorsArray = sponsorArray.slice(0, 5);
        lastSponsor = sponsorArray.pop();
        team.sponsors = sponsorArray.join(', ');
        team.sponsors += ' & ' + lastSponsor;
        lastSponsor = topSponsorsArray.pop();
        team.topSponsors = topSponsorsArray.join(', ');
        team.topSponsors += ' & ' + lastSponsor;
      }
      if (organizationArray.length === 1 && !team.organization) {
        team.organization = organizationArray[0];
      } else {
        if (!team.organization) {
          organizationArray.shift();
          team.organization = organizationArray.join(' & ');
        }
      }

      function trimArray(arr) {
        let i: number;
        for (i = 0; i <= arr.length - 1; i++) {
          arr[i] = arr[i].trim();
        }
        return arr;
      }
    }
    return teams;
  }

  getAwards(teams: TeamData[]) {
    let team: TeamData;
    for (team of teams) {
      this.service.getTeamAwards(this.stateManager.getSelectedSeason(), team.teamNumber).subscribe(awards => {
        team.awards = awards;
      }, err => {
        console.error(err);
      });
    }
    return teams;
  }

}
