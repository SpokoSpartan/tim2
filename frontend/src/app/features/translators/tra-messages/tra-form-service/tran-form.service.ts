import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { MessageForTranslator } from '../../../../shared/types/DTOs/output/MessageForTranslator';


@Injectable({
	providedIn: 'root'
})
export class TranFormService {

	private submitFormSubject = new ReplaySubject();
	submitForm$ = this.submitFormSubject.asObservable();
	private formSubmitSubject = new ReplaySubject();
	formSubmitted$ = this.submitFormSubject.asObservable();
	private addTranslationSubject = new ReplaySubject<MessageForTranslator>();
	addTranslation$ = this.addTranslationSubject.asObservable();

	selectedMessageId = -1;
	selectedTranslationId = -1;

	// form params
	content = '';

	constructor() {
	}

	public setContent(content: string) {
		this.content = content;
	}

	public emitSubmitForm(mode: string) {
		this.submitFormSubject.next(mode);
	}

	public emitFormSubmitted(success: boolean) {
		this.formSubmitSubject.next(success);
	}

	public emitAddTranslation(message) {
		this.addTranslationSubject.next(message);
	}

	public setSelectedTranslationId(id: number) {
		this.selectedTranslationId = id;
	}

	public setSelectedMessageId(id: number) {
		this.selectedMessageId = id;
	}


}
