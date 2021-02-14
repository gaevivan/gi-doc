import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, take, withLatestFrom } from 'rxjs/operators';
import { jsPDF } from "jspdf";
import * as PDF from "pdfkit";


interface Section {
  index: string;
  title: string;
  content: string;
  subsectionsList: Section[];
}

@Injectable()
export class FormService {
  public readonly sectionControlList$: BehaviorSubject<FormArray> = new BehaviorSubject<FormArray>(
    new FormArray([])
  );
  public readonly selectedSectionControlIndex$: BehaviorSubject<number> = new BehaviorSubject<number>(
    null
  );
  public readonly selectedSectionControl$: Observable<FormGroup> = this.selectedSectionControlIndex$.pipe(
    withLatestFrom(this.sectionControlList$),
    map(([index, sectionFormArray]: [number, FormArray]) => {
      if (index === null) {
        return null;
      }
      const control: AbstractControl = sectionFormArray.at(index);
      if (control instanceof FormGroup) {
        return control;
      }
      return null;
    })
  );
  public readonly name: string = 'document name';

  public removeSection(): void {
    this.selectedSectionControlIndex$
      .pipe(
        take(1),
        filter((selectedIndex: number) => selectedIndex !== null),
        withLatestFrom(this.sectionControlList$)
      )
      .subscribe(([index, formArray]: [number, FormArray]) => {
        formArray.removeAt(index);
        const newIndex: number = index > 0 ? index - 1 : index;
        this.selectSection(newIndex < formArray.length ? newIndex : null);
      });
  }

  public addSection(): void {
    this.sectionControlList$
      .pipe(
        take(1),
        map((formArray: FormArray) => {
          const newFormArray: FormArray = new FormArray(formArray.controls);
          const newSection: FormGroup = new FormGroup({
            index: new FormControl(`${formArray.length + 1}`),
            title: new FormControl('Новый раздел'),
            content: new FormControl(''),
            subsectionsList: new FormArray([]),
          });
          newFormArray.push(newSection);
          return newFormArray;
        })
      )
      .subscribe((newFormArray: FormArray) =>
        this.sectionControlList$.next(newFormArray)
      );
  }

  public addSubsection(): void {
    this.selectedSectionControlIndex$
      .pipe(
        take(1),
        filter((selectedIndex: number) => selectedIndex !== null),
        withLatestFrom(this.sectionControlList$),
        map(([selectedIndex, formArray]: [number, FormArray]) => {
          const selectedSection: Section = formArray.at(selectedIndex).value;
          const newSubsection: Section = {
            index: `${selectedSection.index} ${
              selectedSection.subsectionsList.length + 1
            }`,
            title: '',
            content: '',
            subsectionsList: [],
          };
          const newSubsectionList: Section[] = [
            ...selectedSection.subsectionsList,
            newSubsection,
          ];
          const newSectionFormGroup: FormGroup = new FormGroup({
            index: new FormControl(selectedSection.index),
            title: new FormControl(selectedSection.title),
            content: new FormControl(selectedSection.content),
            subsectionsList: FormService.getSectionFormArray(newSubsectionList),
          });
          return [newSectionFormGroup, selectedIndex, formArray];
        })
      )
      .subscribe(
        ([newSectionFormGroup, selectedIndex, formArray]: [
          FormGroup,
          number,
          FormArray
        ]) => {
          formArray.at(selectedIndex).patchValue(newSectionFormGroup);
        }
      );
  }

  public exportPDF(): void {
    this.sectionControlList$.pipe(take(1)).subscribe((
      controlList: FormArray
    ) => {
      const data: Section[] = controlList.value;
      const doc = new jsPDF({
        orientation: 'p',
        format: 'a4',
        unit: 'px'
      });
      doc.setFont('PTSans');
      doc.setLanguage('ru');
      data.forEach((section: Section, index: number) => {
        if (index !== 0) {
          doc.addPage();
        }
        doc.setLanguage('ru-MO');
        // doc.text(section.title, 10, 10);
        doc.text(section.content, 10, 30);
      });
      console.log(data);
      doc.save(`${this.name}.pdf`);
    });
  }

  public initFormArray(): void {
    const sectionFormArray: FormArray = new FormArray([]);
    this.sectionControlList$.next(sectionFormArray);
    this.selectSection(null);
  }

  public selectSection(index: number): void {
    this.selectedSectionControlIndex$.next(index);
  }

  private static getSectionFormArray(sectionList: Section[]): FormArray {
    const formGroupList: FormGroup[] = sectionList.map((section: Section) => {
      return new FormGroup({
        title: new FormControl(section.title),
        content: new FormControl(section.content),
        index: new FormControl(section.index),
        subsectionsList: FormService.getSectionFormArray(
          section.subsectionsList
        ),
      });
    });
    return new FormArray(formGroupList);
  }
}
