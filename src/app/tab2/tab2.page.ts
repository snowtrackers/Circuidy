import { Component, OnInit } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';

import * as L from 'leaflet';

import { ActionSheetController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  providers: [Geolocation]
})
export class Tab2Page implements OnInit {
  map: L.Map;

  watch: any;

  constructor(
      private geo: Geolocation,
      private actionSheetController: ActionSheetController,
      private http: HttpClient
    ) { }

  ngOnInit() {
    this.map = L.map('map');

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    this.locate();

    this.watch = this.geo.watchPosition();
    this.watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      // data.coords.latitude
      // data.coords.longitude
      this.http.post('http://servuc.fr:3000/positions?lat=' + data.coords.latitude + '&lon=' + data.coords.longitude, {}).subscribe();
    });
  }

  locate(): void {
    this.geo.getCurrentPosition().then(
      (response) => {
        this.map.setView([response.coords.latitude, response.coords.longitude], 12);

        this.setLeHavreCircles();

        this.setParcours();
      },
      (reason) => {
        console.error(reason);
      }
    );
  }

  private setParcours() {
    this.http.get('/assets/GPSCoordinate/parcours.gpx', { responseType: 'text' })
      .subscribe(xmlData => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlData, 'text/xml');

        let points = new Array<L.LatLng>();

        for (const elt of Array.from(xml.querySelectorAll('trkseg'))) {
          for (const point of Array.from(elt.querySelectorAll('trkpt'))) {
            points.push(new L.LatLng(point.attributes.getNamedItem('lat').value, point.attributes.getNamedItem('lon').value));
          }

          L.polyline(points, {
            color: 'magenta',
            weight: 3,
            opacity: 0.5,
            smoothFactor: 1
          }).addTo(this.map);

          points = [];
        }
      });
  }

  private setLeHavreCircles() {
    this.http.get('/assets/GPSCoordinate/siteRandonne.gpx', { responseType: 'text' })
      .subscribe(xmlData => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlData, 'text/xml');

        for (const elt of Array.from(xml.querySelectorAll('wpt'))) {
          L.circle([elt.attributes.getNamedItem('lat').value, elt.attributes.getNamedItem('lon').value], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.2,
            radius: 10
          }).addTo(this.map);
        }
      });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Noter le lieu',
      buttons: [{
        text: '★',
        handler: () => {
          this.presentActionSheetProblems();
        }
      }, {
        text: '★ ★',
        handler: () => {
          this.presentActionSheetProblems();
        }
      }, {
        text: '★ ★ ★',
        handler: () => {
          this.presentActionSheetProblems();
        }
      }, {
        text: '★ ★ ★ ★',
        handler: () => {
          this.sendOpinion('SMILE');
        }
      }, {
        text: '★ ★ ★ ★ ★',
        handler: () => {
          this.sendOpinion('SMILE');
        }
      }, {
        text: 'Ne pas noter',
        icon: 'close',
        role: 'cancel',
        handler: () => {}
      }]
    });
    await actionSheet.present();
  }

  async presentActionSheetProblems() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Signaler un problème',
      buttons: [{
        text: 'Texte effacé',
        handler: () => {
          this.sendOpinion('BAD_TEXT');
        }
      }, {
        text: 'Dispositif abimé',
        handler: () => {
          this.sendOpinion('BROKEN_SIGN');
        }
      }, {
        text: 'Présence de déchets',
        handler: () => {
          this.sendOpinion('APPLE');
        }
      }, {
        text: 'Chemin impraticable',
        handler: () => {
          this.sendOpinion('BAD_ROAD');
        }
      }, {
        text: 'Poubelle pleine/non présente',
        handler: () => {
          this.sendOpinion('DUSTBIN');
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Pas de problème');
        }
      }]
    });
    await actionSheet.present();
  }

  sendOpinion( type: String ) {
    this.geo.getCurrentPosition().then((resp) => {
      this.http.post('http://servuc.fr:3000/notifications?lat=' + resp.coords.latitude + '&lon=' + resp.coords.longitude + '&message=&type=' + type, {}).subscribe();
    }).catch((error) => {});
  }
}
