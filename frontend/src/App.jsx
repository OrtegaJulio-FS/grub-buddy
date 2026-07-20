import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FeedPage } from './pages/FeedPage';
import { SpotPage } from './pages/SpotPage';
import { ProfilePage } from './pages/ProfilePage';
import { ActivityPage } from './pages/ActivityPage';
import { ListPage } from './pages/ListPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/spots/:id" element={<SpotPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/lists/:id" element={<ListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
