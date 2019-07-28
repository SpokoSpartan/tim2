import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Project } from '../../../../shared/types/entities/Project';
import { Message } from '../../../../shared/types/entities/Message';
import { MessageForTranslator } from '../../../../shared/types/DTOs/output/MessageForTranslator';
import { TranFormService } from '../tra-form-service/tran-form.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-tra-messages-table',
	templateUrl: './tra-messages-table.component.html',
	styleUrls: ['./tra-messages-table.component.scss', '../tra-messages.component.scss'],
	animations: [
		trigger('detailExpand', [
			state('collapsed', style({ height: '0px', minHeight: '0' })),
			state('expanded', style({ height: '*' })),
			transition('* => collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
			transition('expanded => *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
			transition('* => expanded', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
			transition('collapsed => *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
		])
	]
})

export class TraMessagesTableComponent implements OnInit, OnChanges {


	@Input() selectedRowIndex = -1;
	@Input() selectedProject: Project;
	@Input() selectedLocale: string = null;
	@Input() messages: Message[] = [];
	@Output() invalidateTranslationEvent = new EventEmitter<any>();

	// table
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	dataSource = new MatTableDataSource<MessageForTranslator>();
	displayedColumns: string[] = ['index', 'content', 'existing', 'upToDate', 'valid'];
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	isLoadingResults = false;
	showForm = false;

	expandedRow = null;
	missing = false;
	outdated = false;
	invalid = false;


	constructor(private cd: ChangeDetectorRef,
				private tranFormService: TranFormService) {
	}

	ngOnInit() {
		this.getMessages();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (this.selectedLocale !== null) {
			this.getMessages();
			this.dataSource.filter = '{';
		}
	}

	async getMessages() {
		this.isLoadingResults = true;
		this.createDataSource(this.messages);
		this.isLoadingResults = false;
	}

	addTranslation(message: MessageForTranslator) {
		this.showForm = true;
		this.selectedRowIndex = message.id;
		this.tranFormService.setSelectedMessageId(message.id);
		this.tranFormService.emitAddTranslation(message);
	}

	updateTranslation(message: MessageForTranslator) {
		this.showForm = true;
		this.tranFormService.setSelectedMessageId(message.id);
		this.tranFormService.setSelectedTranslationId(message.translation.id);
		this.selectedRowIndex = message.id;
	}

	async invalidateTranslation(message: MessageForTranslator) {
		this.invalidateTranslationEvent.emit(message);
	}

	cancelForm() {
		this.selectedRowIndex = -1;
		this.tranFormService.setSelectedMessageId(-1);
	}

	applyFilter(filterValue: string) {
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}

	createDataSource(messages: any[]) {
		this.dataSource = new MatTableDataSource(messages);
		this.dataSource.paginator = this.paginator;
		this.dataSource.filterPredicate = (data, filter: string) => {
			return JSON.stringify(data).toLowerCase().includes(filter.toLowerCase())
				&& this.filterByMissing(data)
				&& this.filterByInvalid(data)
				&& this.filterByOutdated(data);
		};
		this.dataSource.sort = this.sort;
	}

	filterByMissing(row): boolean {
		if (this.missing === false) {
			return true;
		} else {
			if (row.translation === null) {
				return true;
			}
		}
		return false;
	}

	filterByInvalid(row): boolean {
		if (this.invalid === false) {
			return true;
		} else {
			if (row.translation !== null) {
				if (row.translation.isValid === false) {
					return true;
				}
			}
		}
		return false;
	}

	filterByOutdated(row): boolean {
		if (this.outdated === false) {
			return true;
		} else {
			if (row.translation !== null) {
				if (this.isTranslationOutdated(row)) {
					return true;
				}
			}
		}
		return false;
	}

	filterMessages() {
		this.dataSource.filter = '{';
	}

	isTranslationOutdated(message: MessageForTranslator): boolean {
		if (message.translation !== null) {
			return message.updateDate > message.translation.updateDate;
		} else {
			return false;
		}
	}

	public formSubmitted() {
		this.showForm = false;
		this.selectedRowIndex = -1;
		this.tranFormService.setSelectedMessageId(-1);
	}
}
