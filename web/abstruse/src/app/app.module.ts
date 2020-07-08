import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CoreModule } from './core';
import { SharedModule } from './shared';
import { AuthModule } from './auth/auth.module';
import { SetupModule } from './setup/setup.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BuildsModule } from './builds/builds.module';

@NgModule({
  imports: [BrowserModule, AppRoutingModule, CoreModule, SharedModule.forRoot(), AuthModule, SetupModule, BuildsModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
