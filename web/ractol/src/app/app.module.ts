import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { BuildsModule } from './builds/builds.module';

@NgModule({
  imports: [BrowserModule, AppRoutingModule, CoreModule, SharedModule.forRoot(), BuildsModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
