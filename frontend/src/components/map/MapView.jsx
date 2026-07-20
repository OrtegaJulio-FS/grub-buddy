import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapView.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Des Moines, IA - matches the seeded spots' default city, used before any
// spot coordinates are available to fit bounds against.
const DEFAULT_CENTER = [-93.625, 41.5868];

// Popup content is raw DOM Mapbox owns, outside React - a plain <a href>
// (full navigation) rather than a router Link is the pragmatic choice here.
function popupHtml(spot) {
  const rating = spot.average_rating != null ? `${Number(spot.average_rating).toFixed(1)} forks` : 'Not yet rated';
  return `
    <div class="map-popup">
      <a href="/spots/${spot.id}" class="map-popup__name">${spot.name}</a>
      ${spot.category ? `<div class="map-popup__meta">${spot.category}</div>` : ''}
      <div class="map-popup__rating">${rating}</div>
    </div>
  `;
}

export function MapView({ spots }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: DEFAULT_CENTER,
      zoom: 12,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.on('load', () => setMapReady(true));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    for (const marker of markersRef.current) marker.remove();
    markersRef.current = [];

    const spotsWithCoords = spots.filter((s) => s.lat != null && s.lng != null);

    for (const spot of spotsWithCoords) {
      const marker = new mapboxgl.Marker({ color: '#c1592a' })
        .setLngLat([Number(spot.lng), Number(spot.lat)])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setHTML(popupHtml(spot)))
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    }

    if (spotsWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      for (const spot of spotsWithCoords) bounds.extend([Number(spot.lng), Number(spot.lat)]);
      mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15 });
    }
  }, [spots, mapReady]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="map-view__placeholder">
        <p>
          Map view needs a Mapbox access token. Set <code>VITE_MAPBOX_TOKEN</code> in{' '}
          <code>frontend/.env</code> to enable it (see <code>frontend/README.md</code>).
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="map-view" />;
}
