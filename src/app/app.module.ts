import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { ConfigServiceProvider } from './services/config.service';
import { ApiServiceProvider } from './services/api.service';
import { TimeServiceProvider } from './services/time.service';
import { SocketServiceProvider } from './services/socket.service';
import { AuthServiceProvider } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { StatsService } from './services/stats.service';
import { WindowService } from './services/window.service';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [ AppComponent ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    ConfigServiceProvider,
    ApiServiceProvider,
    TimeServiceProvider,
    SocketServiceProvider,
    AuthServiceProvider,
    NotificationService,
    StatsService,
    WindowService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
