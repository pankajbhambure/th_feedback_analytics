import { Op } from 'sequelize';
import { sequelize } from '../../config/sequelize';
import CustomerVisit, { Sentiment } from '../../models/customerVisit.model';
import Rating from '../../models/rating.model';
import Customer from '../../models/customer.model';

export interface KPIRequest {
  startDate: string;
  endDate: string;
  storeId?: string;
}

export interface KPIResponse {
  netSentimentScore: number;
  slaCompliance: number;
  averageRating: number;
  pendingActions: number;
  totalFootcount: number;
  repeatCustomers: number;
}

export class AnalyticsService {
  async getKPIs(request: KPIRequest): Promise<KPIResponse> {
    const { startDate, endDate, storeId } = request;

    const startDateTime = new Date(`${startDate}T00:00:00Z`);
    const endDateTime = new Date(`${endDate}T23:59:59Z`);

    const dateFilter: any = {
      visitDate: {
        [Op.gte]: startDateTime,
        [Op.lte]: endDateTime,
      },
    };

    if (storeId) {
      dateFilter.storeId = storeId;
    }

    const [
      netSentimentScore,
      averageRating,
      totalFootcount,
      repeatCustomers,
    ] = await Promise.all([
      this.calculateNetSentimentScore(dateFilter),
      this.calculateAverageRating(dateFilter),
      this.calculateTotalFootcount(dateFilter),
      this.calculateRepeatCustomers(dateFilter),
    ]);

    return {
      netSentimentScore,
      slaCompliance: 0,
      averageRating,
      pendingActions: 0,
      totalFootcount,
      repeatCustomers,
    };
  }

  private async calculateNetSentimentScore(dateFilter: any): Promise<number> {
    const sentimentCounts = await CustomerVisit.findAll({
      attributes: [
        'sentiment',
        [sequelize.fn('COUNT', sequelize.col('sentiment')), 'count'],
      ],
      where: {
        ...dateFilter,
        sentiment: {
          [Op.in]: [Sentiment.POSITIVE, Sentiment.NEGATIVE],
        },
      },
      group: ['sentiment'],
      raw: true,
    });

    let positiveCount = 0;
    let negativeCount = 0;

    sentimentCounts.forEach((row: any) => {
      if (row.sentiment === Sentiment.POSITIVE) {
        positiveCount = parseInt(row.count, 10);
      } else if (row.sentiment === Sentiment.NEGATIVE) {
        negativeCount = parseInt(row.count, 10);
      }
    });

    const total = positiveCount + negativeCount;
    if (total === 0) {
      return 0;
    }

    return (positiveCount - negativeCount) / total;
  }

  private async calculateAverageRating(dateFilter: any): Promise<number> {
    const result = await Rating.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('Rating.overallRating')), 'avgRating'],
      ],
      include: [
        {
          model: CustomerVisit,
          as: 'visit',
          attributes: [],
          where: dateFilter,
          required: true,
        },
      ],
      raw: true,
    });

    const avgRating = result ? (result as any).avgRating : null;
    return avgRating ? parseFloat(avgRating) : 0;
  }

  private async calculateTotalFootcount(dateFilter: any): Promise<number> {
    const count = await CustomerVisit.count({
      where: dateFilter,
    });

    return count;
  }

  private async calculateRepeatCustomers(dateFilter: any): Promise<number> {
    const result = await CustomerVisit.findAll({
      attributes: [[sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('customer_visits.customer_id'))), 'count']],
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: [],
          where: {
            repeatCustomer: true,
          },
          required: true,
        },
      ],
      where: dateFilter,
      raw: true,
    });

    return result && result.length > 0 ? parseInt((result[0] as any).count, 10) : 0;
  }
}

export default new AnalyticsService();
