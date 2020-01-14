import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CallbackComponent} from './callback/callback.component';
import {AuthGuard} from './auth.guard';
import { SetupComponent } from './setup/setup.component';
import {TeamDataComponent} from './team-data/team-data.component';
import {MatchScheduleComponent} from './match-schedule/match-schedule.component';


const routes: Routes = [
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: '',
    component: SetupComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'teams',
    component: TeamDataComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'matches',
    component: MatchScheduleComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
