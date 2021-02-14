import { NgModule, Type } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GiDocModule } from './gi-doc/gi-doc.module';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'gi-doc'
  },
  {
    path: 'gi-doc',
    loadChildren: (): Promise<Type<GiDocModule>> =>
      import('./gi-doc/gi-doc.module').then((module) => module.GiDocModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
