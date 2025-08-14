import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { UserActivityComponent } from './pages/user-activity/user-activity.component';

const routes: Routes = [
  // ...existing routes...
  {
    path: 'user-activity',
    component: UserActivityComponent,
    canActivate: [AuthGuard]  // Assuming you have an AuthGuard
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }