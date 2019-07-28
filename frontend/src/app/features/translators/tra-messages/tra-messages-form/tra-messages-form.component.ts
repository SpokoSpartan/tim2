import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestService } from '../../../../shared/services/rest/rest.service';
import { SnackbarService } from '../../../../shared/services/snackbar-service/snackbar.service';
import { UtilsService } from '../../../../shared/services/utils-service/utils.service';
import { ProjectsStoreService } from '../../../../stores/projects-store/projects-store.service';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog/confirmation-dialog.service';
import { TranFormService } from '../tra-form-service/tran-form.service';
import { Subscription } from 'rxjs';
import { MessageForTranslator } from '../../../../shared/types/DTOs/output/MessageForTranslator';

@Component({
	selector: 'app-tra-messages-form',
	templateUrl: './tra-messages-form.component.html',
	styleUrls: ['./tra-messages-form.component.scss']
})
export class TraMessagesFormComponent implements OnInit, OnDestroy {


	@Output() closeFormEvent = new EventEmitter<any>();

	translationParams: FormGroup;
	formMode = 'Add';
	toUpdate: any = null;
	showForm = false;
	isLoadingResults = true;

	addNewTranslationSub: Subscription;
	formSubmittedSub: Subscription;

	constructor(private formBuilder: FormBuilder,
				private cd: ChangeDetectorRef,
				private http: RestService,
				private snackbar: SnackbarService,
				private utils: UtilsService,
				private projectsStore: ProjectsStoreService,
				private confirmService: ConfirmationDialogService,
				private projectStoreService: ProjectsStoreService,
				private tranFormService: TranFormService) {
	}

	ngOnInit() {
		this.initTranslationForm();
		this.addNewTranslationSub = this.tranFormService.addTranslation$
		.subscribe((message) => {
			this.addNewTranslation(message);
		});
		this.formSubmittedSub = this.tranFormService.formSubmitted$
		.subscribe((message) => {
			this.formSubmitted(message);
		});
	}


	initTranslationForm() {
		this.translationParams = this.formBuilder.group({
			content: ['', [Validators.required]]
		});
	}

	submitForm(translationParams: any) {
		this.tranFormService.setContent(translationParams.value.content);
		this.tranFormService.emitSubmitForm(this.formMode);
	}


	addNewTranslation(message: MessageForTranslator) {
		this.showForm = true;
	}

	editTranslation(message: MessageForTranslator) {
		if (this.showForm === false) {
			this.showForm = true;
		}

		this.translationParams.patchValue({
			content: message.translation.content,
		});

		this.toUpdate = message;
		this.formMode = 'Update';
	}

	closeForm() {
		this.closeFormEvent.emit(null);
		this.tranFormService.setSelectedMessageId(-1);
		this.toUpdate = null;
		this.formMode = 'Add';
		this.showForm = false;
		this.clearForm();
	}

	clearForm() {
		this.translationParams.reset();
		this.translationParams.markAsPristine();
		this.translationParams.markAsUntouched();
		this.cd.markForCheck();
	}

	private formSubmitted(mode: any) {
		this.closeForm();
	}

	ngOnDestroy() {
		this.addNewTranslationSub.unsubscribe();
		this.formSubmittedSub.unsubscribe();
	}
}
