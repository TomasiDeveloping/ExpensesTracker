import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {ExpendituresComponent} from "./expenditures/expenditures.component";
import {CategoriesComponent} from "./categories/categories.component";
import {SettingsComponent} from "./settings/settings.component";

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'ausgaben', component: ExpendituresComponent},
  {path: 'kategorien', component: CategoriesComponent},
  {path: 'einstellungen', component: SettingsComponent},
  {path: '', redirectTo: '/home', pathMatch: 'full'}
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
