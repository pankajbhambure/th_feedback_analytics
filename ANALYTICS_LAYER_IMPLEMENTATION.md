# Analytics Feedback Layer Implementation

## Overview

The analytics feedback layer consists of three interconnected tables that provide comprehensive quantitative and qualitative feedback tracking, along with store response management.

## Architecture

```
customer_visits (fact table)
    ↓ 1:1
    ├── ratings (quantitative)
    └── feedbacks (qualitative)
            ↓ 1:N
            └── feedback_responses
```

## Entity Definitions

### 1. Ratings (Quantitative Feedback)

**Table:** `ratings`

Stores numeric scores for analytics dashboards, trends, and averages.

**Columns:**
- `id` (UUID) - Primary key
- `customerVisitId` (UUID) - Foreign key to customer_visits (UNIQUE)
- `overallRating` (INTEGER) - Required, 0-5 scale
- `foodRating` (INTEGER) - Optional, 0-5 scale
- `beverageRating` (INTEGER) - Optional, 0-5 scale
- `createdAt`, `updatedAt` (TIMESTAMP)

**Constraints:**
- CHECK: `overallRating >= 0 AND overallRating <= 5`
- CHECK: `foodRating IS NULL OR (foodRating >= 0 AND foodRating <= 5)`
- CHECK: `beverageRating IS NULL OR (beverageRating >= 0 AND beverageRating <= 5)`

**Indexes:**
- UNIQUE on `customerVisitId`
- Index on `overallRating` (for filtering/sorting)

**Associations:**
```typescript
Rating.belongsTo(CustomerVisit, { foreignKey: 'customerVisitId', as: 'visit' })
CustomerVisit.hasOne(Rating, { foreignKey: 'customerVisitId', as: 'rating' })
```

### 2. Feedbacks (Qualitative Feedback)

**Table:** `feedbacks`

Stores free-text customer feedback for sentiment analysis, word clouds, and topic clustering.

**Columns:**
- `id` (UUID) - Primary key
- `customerVisitId` (UUID) - Foreign key to customer_visits (UNIQUE)
- `foodOrdered` (VARCHAR 255) - Optional
- `commentsOnFood` (TEXT) - Optional
- `beveragesOrdered` (VARCHAR 255) - Optional
- `commentsOnBeverage` (TEXT) - Optional
- `overallComments` (TEXT) - Optional
- `feedbackStatus` (ENUM) - 'Pending' or 'Responded'
- `createdAt`, `updatedAt` (TIMESTAMP)

**Enum: FeedbackStatus**
- `Pending` (default)
- `Responded`

**Indexes:**
- UNIQUE on `customerVisitId`
- Index on `feedbackStatus` (for filtering by status)

**Associations:**
```typescript
Feedback.belongsTo(CustomerVisit, { foreignKey: 'customerVisitId', as: 'visit' })
CustomerVisit.hasOne(Feedback, { foreignKey: 'customerVisitId', as: 'feedback' })
Feedback.hasMany(FeedbackResponse, { foreignKey: 'feedbackId', as: 'responses' })
```

### 3. Feedback Responses (Store Replies)

**Table:** `feedback_responses`

Captures store or brand responses to customer feedback for response-time analytics and SLA tracking.

**Columns:**
- `id` (UUID) - Primary key
- `feedbackId` (UUID) - Foreign key to feedbacks
- `respondedBy` (VARCHAR 100) - Optional (store/brand/system)
- `responseText` (TEXT) - Required
- `responseDate` (TIMESTAMP) - Required
- `createdAt`, `updatedAt` (TIMESTAMP)

**Indexes:**
- Index on `feedbackId` (for lookup)
- Index on `responseDate` (for time-based analytics)

**Associations:**
```typescript
FeedbackResponse.belongsTo(Feedback, { foreignKey: 'feedbackId', as: 'feedback' })
Feedback.hasMany(FeedbackResponse, { foreignKey: 'feedbackId', as: 'responses' })
```

## Data Integrity Rules

1. **One Visit, One Feedback**: Each customer visit has exactly one rating and one qualitative feedback record
2. **No Orphaned Data**: Ratings and feedbacks cannot exist without a customer visit (enforced by foreign keys)
3. **Cascade Deletes**: If a visit is deleted, associated ratings and feedbacks are automatically removed
4. **Response Tracking**: Feedback status should be updated to 'Responded' when a response is added
5. **Rating Validation**: All ratings are constrained to 0-5 range at the database level

## Query Examples

### Get Complete Visit with All Feedback

```typescript
const visitWithFeedback = await CustomerVisit.findOne({
  where: { id: visitId },
  include: [
    {
      model: Customer,
      as: 'customer',
    },
    {
      model: Store,
      as: 'store',
      include: [{ model: Region, as: 'region' }],
    },
    {
      model: Rating,
      as: 'rating',
    },
    {
      model: Feedback,
      as: 'feedback',
      include: [{ model: FeedbackResponse, as: 'responses' }],
    },
  ],
});
```

### Average Ratings by Store

```typescript
const storeRatings = await sequelize.query(`
  SELECT
    s."storeId",
    s.city,
    AVG(r."overallRating") as avg_overall,
    AVG(r."foodRating") as avg_food,
    AVG(r."beverageRating") as avg_beverage,
    COUNT(*) as rating_count
  FROM ratings r
  JOIN customer_visits cv ON r."customerVisitId" = cv.id
  JOIN stores s ON cv."storeId" = s.id
  GROUP BY s.id, s."storeId", s.city
  ORDER BY avg_overall DESC
`);
```

### Pending Feedbacks (Need Response)

```typescript
const pendingFeedbacks = await Feedback.findAll({
  where: { feedbackStatus: FeedbackStatus.PENDING },
  include: [
    {
      model: CustomerVisit,
      as: 'visit',
      include: [
        { model: Customer, as: 'customer' },
        { model: Store, as: 'store' },
      ],
    },
  ],
  order: [['createdAt', 'ASC']],
});
```

### Response Time Analysis

```typescript
const responseTimes = await sequelize.query(`
  SELECT
    DATE_TRUNC('month', f."createdAt") as month,
    AVG(EXTRACT(EPOCH FROM (fr."responseDate" - f."createdAt"))/3600) as avg_hours_to_respond,
    COUNT(*) as response_count
  FROM feedbacks f
  JOIN feedback_responses fr ON f.id = fr."feedbackId"
  WHERE f."feedbackStatus" = 'Responded'
  GROUP BY DATE_TRUNC('month', f."createdAt")
  ORDER BY month DESC
`);
```

### Sentiment vs Rating Correlation

```typescript
const sentimentRatingCorrelation = await sequelize.query(`
  SELECT
    cv.sentiment,
    AVG(r."overallRating") as avg_rating,
    COUNT(*) as count
  FROM customer_visits cv
  JOIN ratings r ON cv.id = r."customerVisitId"
  GROUP BY cv.sentiment
  ORDER BY sentiment
`);
```

## Files Created

### Migrations
1. `src/migrations/20231230000011-create-ratings.ts`
2. `src/migrations/20231230000012-create-feedbacks.ts`
3. `src/migrations/20231230000013-create-feedback-responses.ts`

### Models
1. `src/models/rating.model.ts`
2. `src/models/feedback.model.ts`
3. `src/models/feedbackResponse.model.ts`

### Updated
1. `src/models/index.ts` - Added new associations

## TypeScript Types

All models export complete TypeScript interfaces:

```typescript
import { RatingAttributes, RatingCreationAttributes } from './models/rating.model';
import { FeedbackAttributes, FeedbackCreationAttributes, FeedbackStatus } from './models/feedback.model';
import { FeedbackResponseAttributes, FeedbackResponseCreationAttributes } from './models/feedbackResponse.model';
```

## Best Practices

1. **Always use transactions** when creating related records (visit + rating + feedback)
2. **Update feedback status** when adding a response
3. **Validate ratings** at application level before insertion (0-5 range)
4. **Index TEXT fields** if implementing full-text search
5. **Monitor response times** using the responseDate field for SLA compliance
6. **Use eager loading** for common queries to avoid N+1 problems

## Analytics Capabilities

✅ Quantitative rating analysis (overall, food, beverage)
✅ Qualitative text analysis (NLP, sentiment, topics)
✅ Response time tracking and SLA monitoring
✅ Store performance comparison
✅ Channel effectiveness analysis
✅ Time-series trending
✅ Customer journey insights
✅ Sentiment-rating correlation

## Next Steps

This layer is ready for:
- Dashboard integration
- Real-time analytics pipelines
- NLP processing workflows
- Automated response routing
- SLA alert systems
- Report generation
