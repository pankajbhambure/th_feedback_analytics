# Customer Visits Fact Table Implementation

## Overview

The `customer_visits` table is the central analytics fact table that represents a single customer visit with exactly one feedback. This table is optimized for dashboard queries and time-based analytics.

## Table Structure

### Core Fields
- `id` (UUID) - Primary key
- `customerId` (UUID) - Foreign key to customers table
- `storeId` (UUID) - Foreign key to stores table
- `channelId` (VARCHAR) - Channel identifier (swiggy, zomato, instore, magicpin)

### Date Fields
- `visitDate` (DATE) - When the store visit/order occurred
- `feedbackDate` (DATE) - When feedback was submitted

### Denormalized Time Dimensions (Precomputed)
- `visitDay` (VARCHAR) - Day of week (Monday-Sunday)
- `visitWeek` (INTEGER) - Week number (1-53)
- `visitMonth` (INTEGER) - Month (1-12)
- `visitQuarter` (INTEGER) - Quarter (1-4)
- `visitYear` (INTEGER) - Year (2020-2100)

### Analytics Fields
- `sentiment` (ENUM) - Positive, Negative, or Neutral
- `hasFoodOrder` (BOOLEAN) - Whether visit included food order
- `hasBeverageOrder` (BOOLEAN) - Whether visit included beverage order

## Indexes for Analytics Performance

All queries on these fields will be fast:

1. `visitDate` - Time-series queries
2. `feedbackDate` - Feedback timeline analysis
3. `storeId` - Store-specific analytics
4. `channelId` - Channel comparison
5. `sentiment` - Sentiment filtering
6. `customerId` - Customer journey tracking
7. `(visitYear, visitMonth)` - Monthly aggregations
8. `(storeId, visitDate)` - Store timeline
9. `(channelId, visitDate)` - Channel timeline

## Sequelize Models Created

### CustomerVisit Model
Location: `src/models/customerVisit.model.ts`

Includes:
- Full TypeScript type safety
- Sentiment enum definition
- Data validation for all time dimensions
- Timestamp tracking

### Region Model
Location: `src/models/region.model.ts`

### Store Model
Location: `src/models/store.model.ts`

## Associations

```typescript
Customer.hasMany(CustomerVisit)
CustomerVisit.belongsTo(Customer)

Store.hasMany(CustomerVisit)
CustomerVisit.belongsTo(Store)

Region.hasMany(Store)
Store.belongsTo(Region)
```

## Usage Examples

### Query visits by date range
```typescript
const visits = await CustomerVisit.findAll({
  where: {
    visitDate: {
      [Op.between]: ['2024-01-01', '2024-01-31']
    }
  },
  include: [
    { model: Customer, as: 'customer' },
    { model: Store, as: 'store' }
  ]
});
```

### Monthly sentiment analysis by store
```typescript
const monthlyStats = await sequelize.query(`
  SELECT
    "storeId",
    "visitYear",
    "visitMonth",
    sentiment,
    COUNT(*) as visit_count
  FROM customer_visits
  WHERE "visitYear" = 2024
  GROUP BY "storeId", "visitYear", "visitMonth", sentiment
  ORDER BY "visitMonth", sentiment
`);
```

### Channel performance by quarter
```typescript
const channelPerformance = await sequelize.query(`
  SELECT
    "channelId",
    "visitQuarter",
    COUNT(*) as total_visits,
    COUNT(*) FILTER (WHERE sentiment = 'Positive') as positive_count,
    COUNT(*) FILTER (WHERE sentiment = 'Negative') as negative_count
  FROM customer_visits
  WHERE "visitYear" = 2024
  GROUP BY "channelId", "visitQuarter"
  ORDER BY "visitQuarter", "channelId"
`);
```

### Day of week patterns
```typescript
const dayPatterns = await CustomerVisit.findAll({
  attributes: [
    'visitDay',
    [sequelize.fn('COUNT', sequelize.col('id')), 'visitCount']
  ],
  group: ['visitDay'],
  order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
});
```

## Data Integrity

- One visit = one feedback (enforced by design)
- Foreign keys prevent orphaned records
- RESTRICT on delete ensures data consistency
- Enum constraint on sentiment values
- Validation on all time dimension fields

## Next Steps

This table is ready to:
1. Join with ratings table (quantitative feedback)
2. Join with qualitative feedback table
3. Power dashboard analytics
4. Support time-series visualizations
5. Enable customer journey analysis

## Files Modified/Created

1. `src/migrations/20231230000010-create-customer-visits.ts` - Migration
2. `src/models/customerVisit.model.ts` - CustomerVisit model
3. `src/models/region.model.ts` - Region model
4. `src/models/store.model.ts` - Store model
5. `src/models/index.ts` - Updated with all associations
