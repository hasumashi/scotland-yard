'use strict';
import './style.css';

// imported in index.html
// import './node_modules/leaflet/dist/leaflet.css';
// import 'leaflet';
// import 'leaflet-draw';
// import 'leaflet-streetlabels';

/* ----------------- */
function init() {
	const osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	const osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
	const osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib });
	const map = new L.Map('map', {
		center: new L.LatLng(51.509, -0.135),
		zoom: 13.6,
		// zoomDelta: 0.25,
		zoomSnap: 0
	});
	const drawnItems = L.featureGroup().addTo(map);

	// setInterval(function(){
	// 	map.setZoom(0);
	// 	setTimeout(function(){
	// 		map.setZoom(1);
	// 	}, 2000);
	// }, 4000);

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
		const layer = event.layer;

		drawnItems.addLayer(layer);
	});
}


document.addEventListener("DOMContentLoaded", function (event) {
	init();
});
