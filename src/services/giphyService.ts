import { GiphyFetch } from '@giphy/js-fetch-api';

const GIPHY_API_KEY = process.env.GIPHY_API_KEY || '';
const gf = new GiphyFetch(GIPHY_API_KEY);

export const giphyService = {
  async getCelebrationGif(eventType: string): Promise<string> {
    try {
      let searchTerm = 'celebration';
      
      // Customize search term based on event type
      switch (eventType) {
        case 'birthday':
          searchTerm = 'birthday celebration';
          break;
        case 'work-anniversary':
          searchTerm = 'work celebration';
          break;
        case 'custom':
          searchTerm = 'celebration party';
          break;
      }

      // Fetch a random GIF from the search results
      const { data } = await gf.search(searchTerm, {
        limit: 1,
        rating: 'g',
      });

      if (data && data.length > 0) {
        return data[0].images.original.url;
      }

      // Fallback to a default celebration GIF if no results
      return 'https://media.giphy.com/media/26BRq84rhISVf5GDu/giphy.gif';
    } catch (error) {
      console.error('Error fetching GIF:', error);
      // Return a default celebration GIF on error
      return 'https://media.giphy.com/media/26BRq84rhISVf5GDu/giphy.gif';
    }
  }
};
