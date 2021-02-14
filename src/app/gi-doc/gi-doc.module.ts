import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MainPageComponent } from "./components/main-page/main-page.component";
import { GiDocRoutingModule } from "./gi-doc-routing.module";
import { FormService } from "./services/form.service";

const COMPONENTS: Array<any> = [
  MainPageComponent
];

@NgModule({
  declarations: [
    ...COMPONENTS
  ],
  exports: [
    ...COMPONENTS
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GiDocRoutingModule
  ],
  providers: [
    FormService
  ]
})
export class GiDocModule {}