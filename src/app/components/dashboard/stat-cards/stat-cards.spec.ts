import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatCards } from './stat-cards';

describe('StatCards', () => {
  let component: StatCards;
  let fixture: ComponentFixture<StatCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCards],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
