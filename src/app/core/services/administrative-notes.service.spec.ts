import {
  TestBed
} from '@angular/core/testing';

import {
  AdministrativeNotesService
} from './administrative-notes.service';

describe('AdministrativeNotesService', () => {

  let service: AdministrativeNotesService;

  beforeEach(() => {

    localStorage.clear();

    TestBed.configureTestingModule({});

    service =
      TestBed.inject(
        AdministrativeNotesService
      );

  });

  it('should create notes with the current date', () => {

    const note =
      service.createNote({
        title:
          'Averiguar cubiertas R20 cliente Gonzales',
        description:
          'Conseguir cubiertas 285/60R20 para RAM'
      });

    expect(note.id).toBe(1);
    expect(note.createdAt instanceof Date)
      .toBeTrue();
    expect(service.getNotes().length)
      .toBe(1);

  });

  it('should require title and description', () => {

    expect(() =>
      service.createNote({
        title: '',
        description: ''
      })
    ).toThrowError(
      'Completa titulo y descripcion.'
    );

  });

});
