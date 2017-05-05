import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppDashboardComponent } from './components/app-dashboard';

@NgModule({
  declarations: [
    AppComponent,
    AppDashboardComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', component: AppDashboardComponent }
    ]),
    HttpModule,
    FormsModule
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
