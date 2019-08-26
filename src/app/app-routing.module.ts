import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CallbackComponent} from './callback/callback.component';
import {HomeComponent} from './home/home.component';
import {AuthGuard} from './auth.guard';


const routes: Routes = [
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
