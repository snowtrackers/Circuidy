import { Component } from '@angular/core';
import { faWheelchair} from '@fortawesome/free-solid-svg-icons';
import { Tab2Page } from '../tab2/tab2.page';
import { Router } from '@angular/router';

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
  intro = true;

  constructor(private router:Router){
    
  }

  go(){
    this.router.navigateByUrl("tabs/tab2");
  }
}

