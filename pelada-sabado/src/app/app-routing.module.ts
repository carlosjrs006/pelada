import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { JogadoresComponent } from './components/jogadores/jogadores.component';
import { PeladaComponent } from './components/pelada/pelada.component';
import { TimesComponent } from './components/times/times.component';
import { FinanceiroComponent } from './components/financeiro/financeiro.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pelada', component: PeladaComponent },
  { path: 'times', component: TimesComponent },
  { path: 'jogadores', component: JogadoresComponent },
  { path: 'financeiro', component: FinanceiroComponent },
  { path: '**', redirectTo: '/dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
