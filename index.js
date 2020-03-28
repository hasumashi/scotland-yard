'use strict';
import './style.css';

import scotlandYardMap from './map';
console.log(scotlandYardMap)

// imported in index.html
// import './node_modules/leaflet/dist/leaflet.css';
// import 'leaflet';
// import 'leaflet-draw';
// import 'leaflet-streetlabels';
window.L = L;
let map;
let player = {
	currentPlace: 1,
	availablePlaces: null,
	marker: null,
}


window.data = []

const ICON_ASSET = {
	taxi: require('./assets/marker-taxi.png'),
	bus: require('./assets/marker-bus.png'),
	metro: require('./assets/marker-metro.png'),
};

const TYPE_COLOR = {
	'taxi': '#c70',
	'bus': '#090',
	'metro': '#e91e63',
}

function selectionStart(event) {
	console.log(event)
	const available = getAvailable(player.currentPlace)
	player.availablePlaces = available.places;
	console.log(available)

	map.eachLayer((layer) => {
		if (layer instanceof L.Marker && layer.__placeNum !== undefined) {
			console.log(available.places, layer.__placeNum, available.places.includes(layer.__placeNum))
			if (!available.places.includes(layer.__placeNum))
				layer.setOpacity(0.5)

			console.log(layer)
		}
	});
}

function handleDestPlaceClick(destPlace, event) {
	console.log('pass?', destPlace, player.availablePlaces)
	if (player.availablePlaces === null)
		return false

	console.log('passed')

	if (player.availablePlaces.includes(+destPlace)) {
		console.log('hit', event.target.editing._marker)
		player.marker.setLatLng(event.target.editing._marker.getLatLng())
		player.currentPlace = destPlace
		console.log()
	}

	map.eachLayer((layer) => {
		if (layer instanceof L.Marker)
			layer.setOpacity(1)
	})
	player.availablePlaces = null
}

function getPlaceMarkerIcon(number, type = 'taxi') {
	const iconImg = ICON_ASSET[type]
	return new L.DivIcon({
		className: 'place',
		html: `<img class="place-image" src="${iconImg}"/>
			<span class="place-number">${number}</span>`
	})
}

function loadMap(mapFile) {
	for (const key in mapFile.places) {
		if (mapFile.places.hasOwnProperty(key)) {
			const place = mapFile.places[key]

			const icon = getPlaceMarkerIcon(key, place.type)
			const marker = L.marker([place.lat, place.lng], { icon })
			marker.__placeNum = +key;
			marker.on('click', e => handleDestPlaceClick(key, e))
			marker.addTo(map)
		}
	}

	mapFile.routes.forEach(route => {
		L.polyline(route.latlngs, { color: TYPE_COLOR[route.type] }).addTo(map)
	})
}

/* ----------------- */
function init() {
	const osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	const osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
	const osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib });
	map = new L.Map('map', {
		center: new L.LatLng(...scotlandYardMap.mapSettings.center),
		zoom: scotlandYardMap.mapSettings.zoom,
		// center: new L.LatLng(51.509, -0.135),
		// zoom: 13.6,
		zoomControl: false,
		zoomSnap: 0
	});
	const drawnItems = L.featureGroup().addTo(map);

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
		// console.log('added', layer)

		if (layer instanceof L.Polyline) {
			// console.log('line', layer.getLatLngs())
			window.data.push({
				latlngs: layer.getLatLngs(),
				type: 'taxi',
				from: 0, to: 0
			})
		}

		drawnItems.addLayer(layer);
	});

	/* --------- */

}


function getAvailable(from) {
	const fromPlace = scotlandYardMap.places[from];
	const availablePlaces = []
	const availableRoutes = scotlandYardMap.routes.filter(route => {
		if (route.from == from)
			availablePlaces.push(route.to)
		else if (route.to == from)
			availablePlaces.push(route.from)

		return route.from == from || route.to == from
	})

	return {
		places: availablePlaces,
		routes: availableRoutes,
	}
}



document.addEventListener("DOMContentLoaded", function (event) {
	init()
	loadMap(scotlandYardMap)


	const startpos = scotlandYardMap.places[player.currentPlace]
	player.marker = L.marker([startpos.lat, startpos.lng])
		.addTo(map)
		.on('click', selectionStart)

});


