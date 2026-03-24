import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { JogadoresComponent } from './components/jogadores/jogadores.component';
import { PeladaComponent } from './components/pelada/pelada.component';
import { TimesComponent } from './components/times/times.component';
import { PresencaCountPipe } from './pipes/presenca-count.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    JogadoresComponent,
    PeladaComponent,
    TimesComponent,
    PresencaCountPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
