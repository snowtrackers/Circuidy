import { Component, OnInit } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';

import * as L from 'leaflet';
import { ToastController } from '@ionic/angular';

import { ActionSheetController } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";

import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  providers: [Geolocation, QRScanner]
})
export class Tab2Page implements OnInit {
  map: L.Map;

  watch:any;

  constructor(
      private geo: Geolocation,
      private toast: ToastController,
      private actionSheetController: ActionSheetController,
      private http: HttpClient,
      private qrScanner: QRScanner
    ) { }

  ngOnInit() {
    this.map = L.map('map');

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map'
    }).addTo(this.map);

    this.locate();

    this.watch = this.geo.watchPosition();
    this.watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      // data.coords.latitude
      // data.coords.longitude
      this.http.post("http://servuc.fr:3000/positions?lat=" + data.coords.latitude + "&lon=" + data.coords.longitude, {}).subscribe();

    });
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
          this.sendOpinion("SMILE");
        }
      }, {
        text: '★ ★ ★ ★ ★',
        handler: () => {
          this.sendOpinion("SMILE");
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
          this.sendOpinion("BAD_TEXT");
        }
      }, {
        text: 'Dispositif abimé',
        handler: () => {
          this.sendOpinion("BROKEN_SIGN");
        }
      }, {
        text: 'Présence de déchets',
        handler: () => {
          this.sendOpinion("APPLE");
        }
      }, {
        text: 'Chemin impraticable',
        handler: () => {
          this.sendOpinion("BAD_ROAD");
        }
      }, {
        text: 'Poubelle pleine/non présente',
        handler: () => {
          this.sendOpinion("DUSTBIN");
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
      this.http.post("http://servuc.fr:3000/notifications?lat=" + resp.coords.latitude + "&lon=" + resp.coords.longitude + "&message=&type=" + type, {}).subscribe();
    }).catch((error) => {
    });
  }

  scan(){
    // Optionally request the permission early
    this.qrScanner.prepare()
    .then((status: QRScannerStatus) => {
      if (status.authorized) {
        // camera permission was granted


        // start scanning
        let scanSub = this.qrScanner.scan().subscribe((text: string) => {
          console.log('Scanned something', text);

          this.qrScanner.hide(); // hide camera preview
          scanSub.unsubscribe(); // stop scanning
        });

      } else if (status.denied) {
        // camera permission was permanently denied
        // you must use QRScanner.openSettings() method to guide the user to the settings page
        // then they can grant the permission from there
      } else {
        // permission was denied, but not permanently. You can ask for permission again at a later time.
      }
    })
    .catch((e: any) => console.log('Error is', e));
  }
}
