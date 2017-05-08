import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { ConfigServiceProvider } from './services/config.service';
import { ApiServiceProvider } from './services/api.service';
import { SocketServiceProvider } from './services/socket.service';
import { AppComponent } from './app.component';
import { AppSetupComponent } from './components/app-setup';
import { AppTerminalComponent } from './components/app-terminal';
import { AppLoginComponent } from './components/app-login';
import { AppHeaderComponent } from './components/app-header';
import { AppDashboardComponent } from './components/app-dashboard';

@NgModule({
  declarations: [
    AppComponent,
    AppSetupComponent,
    AppTerminalComponent,
    AppLoginComponent,
    AppDashboardComponent,
    AppHeaderComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', component: AppDashboardComponent },
      { path: 'login', component: AppLoginComponent },
      { path: 'setup', component: AppSetupComponent }
    ]),
    HttpModule,
    FormsModule
  ],
  providers: [
    ConfigServiceProvider,
    ApiServiceProvider,
    SocketServiceProvider
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
