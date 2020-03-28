'use strict';
import './style.css';
// import 'leaflet/dist/images/marker-icon-2x.png';
// import 'leaflet/dist/images/marker-shadow.png';

import './node_modules/leaflet/dist/leaflet.css';
import 'leaflet';

// console.log('Hello World');
// var mymap = L.map('mapid').setView([51.505, -0.09], 13);
// L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
// }).addTo(mymap);

/* ----------------- */
function init() {
	var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib }),
		map = new L.Map('map', { center: new L.LatLng(51.505, -0.04), zoom: 13 }),
		drawnItems = L.featureGroup().addTo(map);
	L.control.layers({
		'osm': osm.addTo(map),
		"google": L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
			attribution: 'google'
		})
	}, { 'drawlayer': drawnItems }, { position: 'topleft', collapsed: false }).addTo(map);
	map.addControl(new L.Control.Draw({
		edit: {
			featureGroup: drawnItems,
			poly: {
				allowIntersection: false
			}
		},
		draw: {
			polygon: {
				allowIntersection: false,
				showArea: true
			}
		}
	}));

	map.on(L.Draw.Event.CREATED, function (event) {
		var layer = event.layer;

		drawnItems.addLayer(layer);
	});
}


document.addEventListener("DOMContentLoaded", function (event) {
	init();
});
