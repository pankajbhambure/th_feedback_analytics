import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const famepilotConfig = {
      baseUrl: 'https://api.famepilot.com/reviews',
      httpMethod: 'GET',
      authType: 'API_KEY',
      authConfig: JSON.stringify({
        appIdHeaderName: 'X-App-Id',
        apiKeyHeaderName: 'X-API-Key',
        appId: 'your-famepilot-app-id-here',
        apiKey: 'your-famepilot-api-key-here',
      }),
      dateFromParam: 'start_date',
      dateToParam: 'end_date',
      dateFormat: 'YYYY-MM-DD',
      paginationType: 'PAGE',
      pageParam: 'page',
      startPage: 1,
      requestSchema: null,
      responseSchema: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert('channels', [
      {
        id: uuidv4(),
        channelId: 'zomato',
        channelName: 'Zomato Reviews',
        ...famepilotConfig,
      },
      {
        id: uuidv4(),
        channelId: 'swiggy',
        channelName: 'Swiggy Reviews',
        ...famepilotConfig,
      },
      {
        id: uuidv4(),
        channelId: 'google',
        channelName: 'Google Reviews',
        ...famepilotConfig,
      },
      {
        id: uuidv4(),
        channelId: 'magicpin',
        channelName: 'Magicpin Reviews',
        ...famepilotConfig,
      },
    ]);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('channels', {
      channelId: ['zomato', 'swiggy', 'google', 'magicpin'],
    });
  },
};
