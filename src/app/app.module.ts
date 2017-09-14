import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NgUploaderModule } from 'ngx-uploader';
import { ConfigServiceProvider } from './services/config.service';
import { ApiServiceProvider } from './services/api.service';
import { TimeServiceProvider } from './services/time.service';
import { SocketServiceProvider } from './services/socket.service';
import { AuthGuardProvider, AuthGuard } from './services/auth-guard.service';
import { AccessGuardProvider, AccessGuard } from './services/access-guard.service';
import { AuthServiceProvider } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { StatsService } from './services/stats.service';
import { EqualValidator } from './directives/equal-validator.directive';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { ToTimePipe } from './pipes/to-time.pipe';
import { AppComponent } from './app.component';
import { AppSetupComponent } from './components/app-setup';
import { AppTerminalComponent } from './components/app-terminal';
import { AppLoginComponent } from './components/app-login';
import { AppHeaderComponent } from './components/app-header';
import { AppBuildsComponent } from './components/app-builds';
import { AppBuildDetailsComponent } from './components/app-build-details';
import { AppBuildItemComponent } from './components/app-build-item';
import { AppRepositoriesComponent } from './components/app-repositories';
import { AppRepositoryComponent } from './components/app-repository';
import { AppJobComponent } from './components/app-job';
import { AppUserComponent } from './components/app-user';
import { AppSettingsComponent } from './components/app-settings';
import { AppTeamComponent } from './components/app-team';
import { AppLogsComponent } from './components/app-logs';
import { AppDashboardComponent } from './components/app-dashboard';
import { AppLineChartComponent } from './components/app-line-chart';


@NgModule({
  declarations: [
    AppComponent,
    AppSetupComponent,
    AppTerminalComponent,
    AppLoginComponent,
    AppHeaderComponent,
    AppBuildsComponent,
    AppBuildDetailsComponent,
    AppBuildItemComponent,
    AppRepositoriesComponent,
    AppRepositoryComponent,
    AppJobComponent,
    AppSettingsComponent,
    AppTeamComponent,
    AppUserComponent,
    AppLogsComponent,
    AppDashboardComponent,
    AppLineChartComponent,
    EqualValidator,
    SafeHtmlPipe,
    ToTimePipe
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot([
      {
        path: '',
        pathMatch: 'full',
        component: AppDashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'builds',
        component: AppBuildsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'build/:id',
        component: AppBuildDetailsComponent,
        canActivate: [AuthGuard, AccessGuard]
      },
      {
        path: 'job/:id',
        component: AppJobComponent,
        canActivate: [AuthGuard, AccessGuard]
      },
      {
        path: 'repositories',
        component: AppRepositoriesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'repo/:id',
        component: AppRepositoryComponent,
        canActivate: [AuthGuard, AccessGuard]
      },
      {
        path: 'settings',
        component: AppSettingsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'team',
        component: AppTeamComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'user/:id',
        component: AppUserComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'logs',
        component: AppLogsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'login',
        component: AppLoginComponent
      },
      {
        path: 'setup',
        component: AppSetupComponent
      }
    ]),
    HttpModule,
    FormsModule,
    NgUploaderModule
  ],
  providers: [
    ConfigServiceProvider,
    ApiServiceProvider,
    TimeServiceProvider,
    SocketServiceProvider,
    AuthServiceProvider,
    AuthGuardProvider,
    AccessGuardProvider,
    NotificationService,
    StatsService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
