import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RestService } from '../../../shared/services/rest/rest.service';

@Component({
	selector: 'app-aggregate-info',
	templateUrl: './aggregate-info.component.html',
	styleUrls: ['./aggregate-info.component.scss']
})
export class AggregateInfoComponent implements OnInit, OnChanges {

	@Input() selectedProjectId: number;
	aggregatedInfoList: any;
	aggregatedInfo = null;

	constructor(private http: RestService) {
	}

	ngOnInit() {
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.getAggregatedInfo();
	}

	public async getAggregatedInfo() {
		if (this.selectedProjectId !== null) {
			const response = await this.http.getAll('project/developer/aggregate/' + this.selectedProjectId);
			this.aggregatedInfo = response;
			this.aggregatedInfoList = response.translationStatusesByLocale;
		}
	}
}
