import { Component, OnInit, Output, ContentChild, EventEmitter, ElementRef, OnDestroy } from '@angular/core';
import { ViewModeDirective } from 'src/app/directives/view-mode.directive';
import { EditModeDirective } from 'src/app/directives/edit-mode.directive';

import { fromEvent, Subject, Observable } from 'rxjs';
import { switchMap, takeUntil, filter, take, switchMapTo } from 'rxjs/operators';

@Component({
  selector: 'app-editable',
  templateUrl: './editable.component.html',
  styleUrls: ['./editable.component.scss']
})
export class EditableComponent implements OnInit, OnDestroy {

  @Output() update = new EventEmitter();
  @ContentChild(ViewModeDirective, {static: true}) viewModeTpl: ViewModeDirective;
  @ContentChild(EditModeDirective, {static: true}) editModeTpl: EditModeDirective;
  
  mode: 'view' | 'edit' = 'view';

  editMode = new Subject();
  editMode$ = this.editMode.asObservable();

  constructor(private host: ElementRef) { }

  get currentView() {
    return this.mode === 'view' ? this.viewModeTpl.tpl : this.editModeTpl.tpl;
  }

  private get element() {
    return this.host.nativeElement;
  }

  ngOnInit() {
    this.viewModeHandler();
    this.editModeHandler();
  }

  
  private viewModeHandler() {
    fromEvent(this.element, 'dblclick').pipe(
      untilDestroyed(this)
    ).subscribe(() => { 
      this.mode = 'edit';
      this.editMode.next(true);
    });
  }

  private editModeHandler() {
    const clickOutside$ = fromEvent(document, 'click').pipe(
      filter(({ target }) => this.element.contains(target) === false),
      take(1)
    )

    this.editMode$.pipe(
      switchMapTo(clickOutside$),
      untilDestroyed(this)
    ).subscribe(event => this.toViewMode());
  }

  toViewMode() {
    this.update.next();
    this.mode = 'view';
  }

  ngOnDestroy() {
  }
}


function isFunction(value) {
  return typeof value === 'function';
}

const untilDestroyed = (
  componentInstance,
  destroyMethodName = 'ngOnDestroy'
) => <T>(source: Observable<T>) => {
  const originalDestroy = componentInstance[destroyMethodName];
  if (isFunction(originalDestroy) === false) {
    throw new Error(
      `${
        componentInstance.constructor.name
      } is using untilDestroyed but doesn't implement ${destroyMethodName}`
    );
  }
  if (!componentInstance['__takeUntilDestroy']) {
    componentInstance['__takeUntilDestroy'] = new Subject();

    componentInstance[destroyMethodName] = function() {
      isFunction(originalDestroy) && originalDestroy.apply(this, arguments);
      componentInstance['__takeUntilDestroy'].next(true);
      componentInstance['__takeUntilDestroy'].complete();
    };
  }
  return source.pipe(takeUntil<T>(componentInstance['__takeUntilDestroy']));
};