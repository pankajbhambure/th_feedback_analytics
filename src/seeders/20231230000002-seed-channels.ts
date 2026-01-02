import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkInsert('channels', [
      {
        id: uuidv4(),
        channelId: 'instore',
        channelName: 'Instore Feedback',
        baseUrl: 'https://dipstick.timhortonsindia.com/server/api/v1/feedbacks',
        httpMethod: 'GET',
        authType: 'API_KEY',
        authConfig: JSON.stringify({
          apiKey: 'your-api-key-here',
          apiKeyHeaderName: 'x-api-key',
        }),
        dateFromParam: 'startDate',
        dateToParam: 'endDate',
        dateFormat: 'YYYY-MM-DD',
        paginationType: 'PAGE',
        pageParam: 'page',
        startPage: 1,
        requestSchema: null,
        responseSchema: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('channels', { channelId: 'instore' });
  },
};
