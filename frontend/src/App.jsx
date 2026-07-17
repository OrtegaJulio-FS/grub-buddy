import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FeedPage } from './pages/FeedPage';
import { SpotPage } from './pages/SpotPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/spots/:id" element={<SpotPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
