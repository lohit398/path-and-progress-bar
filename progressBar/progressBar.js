import { LightningElement, api } from 'lwc';

export default class App extends LightningElement {
    steps;
    __currentStage = 0;
    @api totalNumberOfStages;
    fillPercentage;
    __initial = true;

    @api
    get currentStage() {
        return this.__currentStage
    }

    set currentStage(value) {
        if (this.__currentStage < this.totalNumberOfStages - 1) {
            this.__currentStage = parseInt(value);
            this.fillPercentage = (this.__currentStage / (parseInt(this.totalNumberOfStages) - 1)) * 100;
            this.fillPercentage = this.fillPercentage < 100 ? this.fillPercentage + 1 : 100;
        }
        if (this.template.querySelector('[data-type="valuesetter"]') != null) {
            this.template.querySelector('[data-type="valuesetter"]').style.width = this.fillPercentage + '%';
            this.template.querySelector('.slds-is-active').classList.remove('slds-is-active');
            this.template.querySelector('[data-item="' + (this.__currentStage + 1) + '"]').classList.add('slds-is-active');
            this.template.querySelector('[data-btn="' + (this.__currentStage) + '"]').style.display = 'block';
        }
    } 

    connectedCallback() {
        this.steps = Array(parseInt(this.totalNumberOfStages)).fill()
            .map((item, index) => index + 1);
    }
    renderedCallback(){
        if(this.__initial){
            this.template.querySelector('[data-item="' + (this.__currentStage + 1) + '"]').classList.add('slds-is-active');
            this.__initial = false;
        }
    }
}
