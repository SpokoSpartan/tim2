import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RestService } from '../../../shared/services/rest/rest.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { UtilsService } from '../../../shared/services/utils-service/utils.service';
import { ProjectsStoreService } from '../../../stores/projects-store/projects-store.service';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog/confirmation-dialog.service';
import { Message } from '../../../shared/types/entities/Message';
import { Project } from '../../../shared/types/entities/Project';
import { TranslationUpdateDTO } from '../../../shared/types/DTOs/input/TranslationUpdateDTO';
import { TranslationCreateDTO } from '../../../shared/types/DTOs/input/TranslationCreateDTO';
import { TranFormService } from './tra-form-service/tran-form.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-tra-messages',
	templateUrl: './tra-messages.component.html',
	styleUrls: ['./tra-messages.component.scss']
})
export class TraMessagesComponent implements OnInit, OnDestroy {

	isLoadingResults = true;

	projects: Project[] = [];
	messages: Message[] = [];

	selectedProject = null;
	selectedLocale: string = null;
	availableLocales: any[] = [];

	submitFormSub: Subscription;
	invalidateTranslationSub: Subscription;

	selectedRowIndex = -1;

	constructor(private formBuilder: FormBuilder,
				private cd: ChangeDetectorRef,
				private http: RestService,
				private snackbar: SnackbarService,
				private utils: UtilsService,
				private projectsStore: ProjectsStoreService,
				private confirmService: ConfirmationDialogService,
				private projectStoreService: ProjectsStoreService,
				private tranFormService: TranFormService) {
		this.selectedProject = this.projectStoreService.getSelectedProject();
	}

	ngOnInit() {
		this.getProjects();
		this.getMessagesForTranslator();
		this.submitFormSub = this.tranFormService.submitForm$
		.subscribe((mode) => {
			this.submitForm(mode);
		});
		this.invalidateTranslationSub = this.tranFormService.invalidateTranslation$
		.subscribe((message) => {
			this.invalidateTranslation(message);
		});
	}

	submitForm(mode: any) {
		if (mode === 'Add') {
			this.addTranslation(new TranslationCreateDTO(this.tranFormService.content, this.selectedLocale));
		} else if (mode === 'Update') {
			this.updateTranslation(new TranslationUpdateDTO(this.tranFormService.content));
		}
	}

	async addTranslation(body) {
		await this.http.save('translation/create' +
			'?messageId=' + this.tranFormService.selectedMessageId, body)
		.subscribe((response) => {
			if (response !== null) {
				this.getMessagesForTranslator();
				this.tranFormService.emitFormSubmitted(true);
				this.selectedRowIndex = -1;
				this.snackbar.snackSuccess('Success!', 'OK');
			} else {
				this.snackbar.snackError('Error', 'OK');
				this.tranFormService.emitFormSubmitted(false);
			}
		}, (error) => {
			this.snackbar.snackError(error.error.message, 'OK');
			this.tranFormService.emitFormSubmitted(false);
		});
	}

	async updateTranslation(body) {
		await this.http.update(
			'translation/update/' + this.tranFormService.selectedTranslationId +
			'?messageId=' + this.tranFormService.selectedMessageId, body)
		.subscribe((response) => {
			if (response !== null) {
				this.getMessagesForTranslator();
				this.tranFormService.emitFormSubmitted(true);
				this.snackbar.snackSuccess('Success!', 'OK');
				this.selectedRowIndex = -1;
			} else {
				this.snackbar.snackError('Error', 'OK');
				this.tranFormService.emitFormSubmitted(false);
			}
		}, (error) => {
			this.snackbar.snackError(error.error.message, 'OK');
			this.tranFormService.emitFormSubmitted(false);
		});

	}

	async getProjects() {
		this.isLoadingResults = true;
		this.projects = await this.http.getAll('project/getAll');
		this.isLoadingResults = false;
	}

	changeProject(value) {
		this.selectedProject = value;
		this.projectStoreService.setSelectedProject(value);
		this.getMessagesForTranslator();
		this.availableLocales = this.selectedProject.targetLocales;
	}

	downloadXLS() {
		this.http.downloadXLS(this.selectedProject);
	}

	async getMessagesForTranslator() {
		if (this.selectedProject && this.selectedLocale) {
			this.isLoadingResults = true;
			this.messages = await this.http.getAll('message/translator/getByLocale/' + this.selectedProject.id + '?locale=' + this.selectedLocale);
			this.messages = [].concat(this.messages);
			this.isLoadingResults = false;
		}
	}

	async invalidateTranslation(message: any) {
		await this.confirmService.openDialog('Are you sure you want to invalidate this translation?').subscribe((result) => {
			if (result) {
				this.http.update('translation/invalidate/' + message.translation.id + '?messageId=' + message.id, null).subscribe((response) => {
					if (response !== null) {
						this.getMessagesForTranslator();
						this.snackbar.snackSuccess('Translation invalidated successfully!', 'OK');
					}
				}, (error) => {
					this.snackbar.snackError(error.error.message, 'OK');
				});
			}
		});
	}

	selectLocale(value: any) {
		this.selectedLocale = value;
		this.getMessagesForTranslator();
	}

	compareProjects(o1: any, o2: any): boolean {
		if (o1 === null || o2 === null) {
			return false;
		} else {
			return o1.name === o2.name;
		}
	}

	ngOnDestroy() {
		this.submitFormSub.unsubscribe();
	}

}
