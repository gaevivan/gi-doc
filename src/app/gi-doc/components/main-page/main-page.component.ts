import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  AbstractControlOptions,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { map, take, withLatestFrom } from 'rxjs/operators';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent {
  public readonly sectionControlList$: Observable<
    AbstractControl[]
  > = this.formService.sectionControlList$.pipe(
    map((formArray: FormArray) => formArray.controls)
  );
  public readonly selectedSectionControl$: Observable<FormGroup> = this
    .formService.selectedSectionControl$;
  public readonly selectedSectionControlIndex$: Observable<number> = this
    .formService.selectedSectionControlIndex$;
  public readonly searchControl: FormControl = new FormControl('');
  public readonly isReadonly$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  public readonly filteredSections$: Observable<
    AbstractControl[]
  > = combineLatest([
    this.searchControl.valueChanges,
    this.sectionControlList$,
  ]).pipe(
    map(([searchValue, controlList]: [string, AbstractControl[]]) => {
      if (!searchValue || !controlList || searchValue.trim().length === 0) {
        return controlList;
      }
      return controlList.filter(
        (control: AbstractControl) =>
          control.value?.title?.includes(searchValue) ||
          control.value?.content?.includes(searchValue)
      );
    })
  );

  constructor(private readonly formService: FormService) {}

  public selectSection(index: number): void {
    this.formService.selectSection(index);
  }

  public addSection(): void {
    this.formService.addSection();
  }

  public removeSection(): void {
    this.formService.removeSection();
  }

  public addSubsection(): void {
    this.formService.addSubsection();
  }

  public exportPDF(): void {
    this.formService.exportPDF();
  }

  public view(): void {
    this.isReadonly$.next(true);
    this.formService.sectionControlList$
      .pipe(take(1))
      .subscribe((formArray: FormArray) => formArray.disable());
  }

  public edit(): void {
    this.isReadonly$.next(false);
    this.formService.sectionControlList$
      .pipe(take(1))
      .subscribe((formArray: FormArray) => formArray.enable());
  }
}
