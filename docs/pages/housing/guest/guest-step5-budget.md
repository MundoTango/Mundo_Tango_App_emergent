# Guest Onboarding - Step 5: Budget & Payment

## Overview
**Route:** `/guest-onboarding` (Step 5)  
**Purpose:** Capture budget range and payment preferences for accommodation matching  
**ESA Framework Layer:** Layer 8 - User Management & Layer 13 - Payments  

## Technical Implementation

### Components Used
- `BudgetStep` - Main step component
- `CurrencySelector` - Multi-currency support
- `BudgetRangeSlider` - Dual-handle range selector
- `PaymentMethodSelector` - Payment options
- `ProgressBar` - Visual progress indicator (83% complete)

### API Endpoints
- `GET /api/currencies/rates` - Current exchange rates
- `POST /api/guest-profile/budget` - Save budget preferences
- `GET /api/payment/methods` - Available payment options
- `GET /api/housing/price-ranges` - Area pricing data

### Real-time Features
- Live currency conversion
- Dynamic pricing suggestions
- Budget distribution visualization
- Payment method validation
- Pricing comparison charts

### Database Tables
```sql
- guest_preferences (budget_data JSONB)
- currency_rates (daily updates)
- payment_methods (supported options)
- pricing_statistics (by area and type)
```

### User Permissions
- **Public Access:** Yes (guest flow)
- **Authentication:** Required for payment setup
- **PCI Compliance:** No card data stored
- **Encryption:** Financial data encrypted

## MT Ocean Theme Implementation
```css
- Currency icons with ocean gradient
- Budget slider with wave animation
- Turquoise for selected range
- Coral accents for warnings
- Glassmorphic payment cards
```

## Test Coverage
**Status:** ✅ Complete  
**Test File:** `tests/e2e/guest/guest-onboarding.e2e.test.ts`  
**Required Tests:** Currency selection, range validation, payment methods

## Known Issues
- Exchange rate API occasional timeouts
- Slider touch sensitivity on mobile
- Some payment methods region-locked

## Agent Responsibilities
- **Finance Agent:** Currency conversion assistance
- **Budget Agent:** Recommend realistic ranges
- **Payment Agent:** Validate payment methods

## Integration Points
- Stripe payment processing
- Currency exchange API
- Regional payment gateways
- Budget analytics tracking
- Host pricing matching

## Performance Metrics
- Average completion: 40 seconds
- Drop-off rate: 15% (highest)
- Currency changes: 1.2 per user
- Bundle size: 52KB

## Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Currency | Dropdown | Yes | Supported currencies |
| Min Budget | Number/Slider | Yes | Positive number |
| Max Budget | Number/Slider | Yes | Greater than min |
| Payment Methods | Multi-select | No | Verification required |

## State Management
```typescript
interface BudgetState {
  currency: string;
  minBudget: number;
  maxBudget: number;
  paymentMethods?: string[];
  includesUtilities?: boolean;
  weeklyRate?: boolean;
  completedAt?: Date;
}
```

## Supported Currencies
- **USD** - US Dollar (default)
- **EUR** - Euro
- **ARS** - Argentine Peso
- **GBP** - British Pound
- **BRL** - Brazilian Real

## Budget Ranges (USD/night)
- **Budget:** $20-50
- **Mid-range:** $50-100
- **Comfort:** $100-200
- **Luxury:** $200+

## Payment Methods
- Credit/Debit Cards (Visa, Mastercard, Amex)
- PayPal
- Bank Transfer
- Local payment methods (MercadoPago)
- Cryptocurrency (selected hosts)

## Financial Security
- No card details stored in onboarding
- PCI DSS compliance for payment processing
- Secure tokenization for saved methods
- Two-factor authentication for high amounts