import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppLoginComponent } from './components/app-login';
import { AppHeaderComponent } from './components/app-header';
import { AppDashboardComponent } from './components/app-dashboard';

@NgModule({
  declarations: [
    AppComponent,
    AppLoginComponent,
    AppDashboardComponent,
    AppHeaderComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', component: AppDashboardComponent },
      { path: 'login', component: AppLoginComponent }
    ]),
    HttpModule,
    FormsModule
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
