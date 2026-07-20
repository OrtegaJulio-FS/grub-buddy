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
//
// Built with createElement + textContent (never string HTML/setHTML) since
// spot.name/spot.category are user-supplied - a spot named
// `<img src=x onerror=...>` must render as literal text, not execute.
function buildPopupContent(spot) {
  const rating = spot.average_rating != null ? `${Number(spot.average_rating).toFixed(1)} forks` : 'Not yet rated';

  const container = document.createElement('div');
  container.className = 'map-popup';

  const link = document.createElement('a');
  link.href = `/spots/${spot.id}`;
  link.className = 'map-popup__name';
  link.textContent = spot.name;
  container.appendChild(link);

  if (spot.category) {
    const meta = document.createElement('div');
    meta.className = 'map-popup__meta';
    meta.textContent = spot.category;
    container.appendChild(meta);
  }

  const ratingEl = document.createElement('div');
  ratingEl.className = 'map-popup__rating';
  ratingEl.textContent = rating;
  container.appendChild(ratingEl);

  return container;
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
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setDOMContent(buildPopupContent(spot)))
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
