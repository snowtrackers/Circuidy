import { Component } from '@angular/core';
import { faWheelchair} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  wheelchair = faWheelchair;

  stepOne = false;
  stepTwo = false;
  stepThree = false;

  segmentChanged1(ev: any) {
    console.log('Segment changed', ev);
  }

  segmentChanged2(ev: any) {
    console.log('Segment changed', ev);
  }

  segmentChanged3(ev: any) {
    console.log('Segment changed', ev);
  }
}

