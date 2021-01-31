import { LightningElement, api, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class StatusBar extends LightningElement {
    @api field;
    @api recordId;
    statusValues;
    __recordTypeId;
    __recordStatus;
    __initial = true;
    __currentIndex;
    __selectedStatus;

    @wire(getRecord, { recordId: '$recordId', layoutTypes: ['Full'] })
    getRecordDetails({ error, data }) {
        if (error)
            console.log(error);
        else if (data) {
            let fieldName = this.field.split('.')[1]
            this.__recordStatus = data.fields[fieldName].value;
            this.__recordTypeId = data.recordTypeId;
        }
    }


    @wire(getPicklistValues, { recordTypeId: '$__recordTypeId', fieldApiName: '$field' })
    getvalues({ error, data }) {
        if (error)
            console.log(error);
        else if (data)
            this.statusValues = data.values;
    }

    get list() {
        Promise.resolve()
            .then(() => {
                if (this.template.querySelector('[data-status="' + this.__recordStatus + '"]') != null && this.__initial === true) {
                    this.markCurrent(this.__recordStatus);
                    let index = parseInt(this.template.querySelector('[data-status="' + this.__recordStatus + '"]').dataset.index);
                    this.markPreviousComplete(index);
                    this.__initial = false;
                }
            })
    }

    handleStatusClick(event) {
        this.__selectedStatus = event.currentTarget.dataset.status;
        this.showPreview();
        let index = parseInt(event.currentTarget.dataset.index);
        this.__currentIndex = index;
    }

    showPreview() {
        this.template.querySelector('[data-status="' + this.__selectedStatus + '"]').classList.add('slds-is-current');
        this.template.querySelector('[data-status="' + this.__selectedStatus + '"]').classList.remove('slds-is-incomplete');
        this.template.querySelector('[data-status="' + this.__selectedStatus + '"]').classList.remove('slds-is-complete');
    }

    handleMarkCurrentStage() {
        if (this.__currentIndex != undefined && this.__selectedStatus != undefined) {
            this.markCurrent(this.__selectedStatus);
            this.markPreviousComplete(this.__currentIndex - 1);
            this.markNextIncomplete(this.__currentIndex + 1, this.statusValues.length);
            this.updateRecordStatus(this.__selectedStatus);
        } else {
            this.showToast('Error!','Please select the appropriate stage','error');
        }
    }

    showToast(title,message,variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }


    updateRecordStatus(value) {
        let fields = {};
        console.log(value);
        fields['Id'] = this.recordId;
        fields[this.field.split('.')[1]] = value;
        const recordInput = { fields };
        updateRecord(recordInput)
        .then(() => {
            this.showToast('SUCCESS','Successfully Updated!!','success');
        })
    }

    markCurrent(status) {
        this.template.querySelector('[data-status="' + status + '"]').classList.remove('slds-is-incomplete');
        this.template.querySelector('[data-status="' + status + '"]').classList.remove('slds-is-complete');
        this.template.querySelector('[data-status="' + status + '"]').classList.add('slds-is-current');
        this.template.querySelector('[data-status="' + status + '"]').classList.add('slds-is-active');
    }

    markPreviousComplete(index) {
        for (let i = 0; i <= index; i++) {
            this.template.querySelector('[data-index="' + i + '"]').classList.remove('slds-is-incomplete');
            this.template.querySelector('[data-index="' + i + '"]').classList.add('slds-is-complete');
            this.template.querySelector('[data-index="' + i + '"]').classList.remove('slds-is-current');
            this.template.querySelector('[data-index="' + i + '"]').classList.remove('slds-is-active');
        }
    }

    markNextIncomplete(current, total) {
        for (let i = current; i < total; i++) {
            this.template.querySelector('[data-index="' + i + '"]').classList.add('slds-is-incomplete');
            this.template.querySelector('[data-index="' + i + '"]').classList.remove('slds-is-complete');
            this.template.querySelector('[data-index="' + i + '"]').classList.remove('slds-is-current');
            this.template.querySelector('[data-index="' + i + '"]').classList.remove('slds-is-active');
        }
    }
}