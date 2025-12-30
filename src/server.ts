import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/sequelize';
import { logger } from './utils/logger';
import './models';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const PORT = parseInt(env.PORT, 10);

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
