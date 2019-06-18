import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ViewModeDirective } from './directives/view-mode.directive';
import { EditModeDirective } from './directives/edit-mode.directive';
import { EditableComponent } from './components/editable/editable.component';

@NgModule({
  declarations: [
    AppComponent,
    ViewModeDirective,
    EditModeDirective,
    EditableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
