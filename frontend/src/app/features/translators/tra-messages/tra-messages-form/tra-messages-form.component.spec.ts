import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraMessagesFormComponent } from './tra-messages-form.component';

describe('TraMessagesFormComponent', () => {
	let component: TraMessagesFormComponent;
	let fixture: ComponentFixture<TraMessagesFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TraMessagesFormComponent]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TraMessagesFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
