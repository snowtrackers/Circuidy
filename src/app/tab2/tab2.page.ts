import { Component, OnInit } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';

import * as L from 'leaflet';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  providers: [Geolocation]
})
export class Tab2Page implements OnInit {
  map: L.Map;

  constructor(
      private geo: Geolocation,
      private toast: ToastController
    ) { }

  ngOnInit() {
    this.map = L.map('map');

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map'
    }).addTo(this.map);

    this.locate();
  }

  locate(): void {
    this.geo.getCurrentPosition().then(
      (response) => {
        this.map.setView([response.coords.latitude, response.coords.longitude], 12);
      },
      (reason) => {
        console.error(reason);
      }
    );
  }
}
