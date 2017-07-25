import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { ConfigServiceProvider } from './services/config.service';
import { ApiServiceProvider } from './services/api.service';
import { SocketServiceProvider } from './services/socket.service';
import { AuthGuardProvider, AuthGuard } from './services/auth-guard.service';
import { AuthServiceProvider } from './services/auth.service';
import { NotificationServiceProvider } from './services/notification.service';
import { EqualValidator } from './directives/equal-validator.directive';
import { AppComponent } from './app.component';
import { AppSetupComponent } from './components/app-setup';
import { AppTerminalComponent } from './components/app-terminal';
import { AppLoginComponent } from './components/app-login';
import { AppHeaderComponent } from './components/app-header';
import { AppBuildsComponent } from './components/app-builds';
import { AppBuildDetailsComponent } from './components/app-build-details';
import { AppRepositoriesComponent } from './components/app-repositories';
import { AppRepositoryComponent } from './components/app-repository';
import { AppJobComponent } from './components/app-job';
import { AppSettingsComponent } from './components/app-settings';
import { AppNotificationComponent } from './components/app-notification';


@NgModule({
  declarations: [
    AppComponent,
    AppSetupComponent,
    AppTerminalComponent,
    AppLoginComponent,
    AppHeaderComponent,
    AppBuildsComponent,
    AppBuildDetailsComponent,
    AppRepositoriesComponent,
    AppRepositoryComponent,
    AppJobComponent,
    AppSettingsComponent,
    AppNotificationComponent,
    EqualValidator
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot([
      {
        path: '',
        pathMatch: 'full',
        component: AppBuildsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'build/:id',
        component: AppBuildDetailsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'job/:id',
        component: AppJobComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'repositories',
        component: AppRepositoriesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'repo/:id',
        component: AppRepositoryComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'settings',
        component: AppSettingsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'login',
        component: AppLoginComponent
      },
      { path: 'setup', component: AppSetupComponent }
    ]),
    HttpModule,
    FormsModule
  ],
  providers: [
    ConfigServiceProvider,
    ApiServiceProvider,
    SocketServiceProvider,
    AuthServiceProvider,
    AuthGuardProvider,
    NotificationServiceProvider
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
