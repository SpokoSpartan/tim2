import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Project } from '../../../shared/types/entities/Project';
import { Message } from '../../../shared/types/entities/Message';
import { RestService } from '../../../shared/services/rest/rest.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { UtilsService } from '../../../shared/services/utils-service/utils.service';
import { ProjectsStoreService } from '../../../stores/projects-store/projects-store.service';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog/confirmation-dialog.service';

@Component({
	selector: 'app-tra-messages-form',
	templateUrl: './tra-messages-form.component.html',
	styleUrls: ['./tra-messages-form.component.scss']
})
export class TraMessagesFormComponent implements OnInit {

	@Output() submitFormEvent = new EventEmitter<any>();

	translationParams: FormGroup;
	formMode = 'Add';
	toUpdate: any = null;
	showForm = false;

	isLoadingResults = true;
	selectedRowIndex = -1;

	selectedProject = null;
	selectedLocale: string = null;
	selectedMessage = null;
	private selectedTranslationId: number;

	constructor(private formBuilder: FormBuilder,
				private cd: ChangeDetectorRef,
				private http: RestService,
				private snackbar: SnackbarService,
				private utils: UtilsService,
				private projectsStore: ProjectsStoreService,
				private confirmService: ConfirmationDialogService,
				private projectStoreService: ProjectsStoreService) {
		this.selectedProject = this.projectStoreService.getSelectedProject();
	}

	ngOnInit() {
		this.initTranslationForm();
	}

	initTranslationForm() {
		this.translationParams = this.formBuilder.group({
			content: ['', [Validators.required]]
		});
	}

	submitForm(message: any) {
		this.selectedRowIndex = message.id;
		this.submitFormEvent.emit(message);
	}

	cancelUpdate() {
		this.selectedMessage = null;
		this.toUpdate = null;
		this.selectedRowIndex = -1;
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
}
