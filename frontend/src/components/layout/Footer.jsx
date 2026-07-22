import './Footer.css';

// Required by OSM's ODbL license whenever their data is displayed - see
// db/import-osm-spots.js for the import that pulled in most of the spots
// this attribution covers.
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__attribution">
          Map data ©{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
            OpenStreetMap
          </a>{' '}
          contributors
        </p>
      </div>
    </footer>
  );
}
