const GIPHY_API_KEY = import.meta.env.VITE_API_GIPHY_API_KEY;

import { GiphyFetch } from '@giphy/js-fetch-api';

const gf = new GiphyFetch(GIPHY_API_KEY);

export default gf;
