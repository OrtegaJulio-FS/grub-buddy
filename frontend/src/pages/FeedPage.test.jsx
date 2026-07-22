import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { FeedPage } from './FeedPage';
import { AuthProvider } from '../context/AuthContext';

// MapView pulls in mapbox-gl, which needs a real browser/WebGL context -
// irrelevant here since the Feed defaults to grid view, never mounting it.
vi.mock('../components/map/MapView', () => ({ MapView: () => null }));

function jsonResponse(status, data) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

function renderFeedPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <FeedPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('FeedPage search box', () => {
  let spotsQueries;

  beforeEach(() => {
    spotsQueries = [];
    global.fetch = vi.fn((url) => {
      const { pathname, search } = new URL(url, 'http://localhost');
      if (pathname === '/auth/me') return Promise.resolve(jsonResponse(401, { error: 'Not authenticated' }));
      if (pathname === '/spots') {
        spotsQueries.push(search);
        return Promise.resolve(jsonResponse(200, []));
      }
      return Promise.resolve(jsonResponse(200, []));
    });
  });

  // Regression test: the Feed's visible search box used to default to the
  // "location" segment (exact-match against city), so typing a spot name
  // there - the most natural first interaction with a search box - sent
  // e.g. `city=Tasty` instead of `search=Tasty` and silently returned zero
  // results, even though matching spots existed. The default segment must
  // be free-text "search", not "location".
  test('typing into the default search box sends a free-text `search` param, not `city`', async () => {
    const { container } = renderFeedPage();

    const input = container.querySelector('.search-bar__input');
    fireEvent.change(input, { target: { value: 'Tasty' } });

    await waitFor(() => {
      expect(spotsQueries.some((qs) => qs.includes('search=Tasty'))).toBe(true);
    });
    expect(spotsQueries.some((qs) => qs.includes('city=Tasty'))).toBe(false);
  });

  // Regression test: switching segments used to leave the previous segment's
  // typed value in state, so a leftover `search` term silently AND-combined
  // with a new `city` filter (and vice versa), zeroing out results even
  // though real matches existed for the new filter alone.
  test('switching segments clears the previous segment\'s value instead of combining them', async () => {
    const { container } = renderFeedPage();

    const input = () => container.querySelector('.search-bar__input');
    fireEvent.change(input(), { target: { value: 'Tasty' } });
    await waitFor(() => expect(spotsQueries.some((qs) => qs.includes('search=Tasty'))).toBe(true));

    fireEvent.click(container.querySelector('button[role="tab"][aria-selected="false"]'));
    fireEvent.change(input(), { target: { value: 'Urbandale' } });

    await waitFor(() => {
      expect(spotsQueries.some((qs) => qs.includes('city=Urbandale') && !qs.includes('search='))).toBe(true);
    });
  });
});
