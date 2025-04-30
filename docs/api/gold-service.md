
# Gold Service API

## Overview

The Gold Service provides functionality for managing gold investments, including creating, updating, deleting, and retrieving gold investment records. It also provides methods for importing/exporting gold investment data and updating gold prices based on current market rates.

## Models

### GoldInvestment

```typescript
interface GoldInvestment {
  id: string;
  type: string;          // "Physical", "Digital", "ETF", "SGB"
  quantity: number;      // in grams
  purchaseDate: Date;
  purchasePrice: number; // price per gram at purchase
  currentPrice: number;  // current price per gram
  value: number;         // total value (quantity * currentPrice)
  location?: string;     // for physical gold
  notes?: string;
  familyMemberId: string;
  lastUpdated: Date;
}
```

## Methods

### Get Gold Investments

Retrieves all gold investments for the current user, updating prices to current market rates.

```typescript
getGoldInvestments(): Promise<GoldInvestment[]>
```

**Returns:**
- Array of gold investment objects with updated current prices and values

**Example:**

```typescript
const goldInvestments = await getGoldInvestments();
console.log(goldInvestments);
```

### Get Gold by ID

Retrieves a specific gold investment by ID.

```typescript
getGoldById(id: string): GoldInvestment | null
```

**Parameters:**
- `id`: String - Unique identifier of the gold investment

**Returns:**
- Gold investment object if found, null otherwise

**Example:**

```typescript
const goldInvestment = getGoldById("gold-123");
if (goldInvestment) {
  console.log(goldInvestment);
}
```

### Create Gold Investment

Creates a new gold investment record.

```typescript
createGold(gold: Omit<GoldInvestment, 'id' | 'lastUpdated'>): Promise<GoldInvestment>
```

**Parameters:**
- `gold`: Object - Gold investment data without id and lastUpdated fields

**Returns:**
- Promise resolving to the created gold investment with id and lastUpdated

**Example:**

```typescript
const newGold = await createGold({
  type: "Physical",
  quantity: 10,
  purchaseDate: new Date("2024-01-15"),
  purchasePrice: 5500,
  currentPrice: 5800,
  value: 58000,
  location: "Bank Locker",
  familyMemberId: "member-1"
});
```

### Update Gold Investment

Updates an existing gold investment record.

```typescript
interface GoldUpdateParams extends Partial<GoldInvestment> {
  forceUpdatePrice?: boolean;
}

updateGold(id: string, updates: GoldUpdateParams): Promise<GoldInvestment | null>
```

**Parameters:**
- `id`: String - Unique identifier of the gold investment
- `updates`: Object - Partial gold investment data to update
- `updates.forceUpdatePrice`: Boolean - Force update of current price from market rates

**Returns:**
- Promise resolving to the updated gold investment, or null if not found

**Example:**

```typescript
const updatedGold = await updateGold("gold-123", {
  quantity: 15,
  location: "Home Safe",
  forceUpdatePrice: true
});
```

### Delete Gold Investment

Deletes a gold investment record.

```typescript
deleteGold(id: string): boolean
```

**Parameters:**
- `id`: String - Unique identifier of the gold investment

**Returns:**
- Boolean indicating success (true) or failure (false)

**Example:**

```typescript
const deleted = deleteGold("gold-123");
if (deleted) {
  console.log("Gold investment deleted successfully");
}
```

### Update Gold Prices

Updates the current prices of all gold investments based on market rates.

```typescript
updateGoldPrices(): Promise<GoldInvestment[]>
```

**Returns:**
- Promise resolving to array of updated gold investments

**Example:**

```typescript
const updatedInvestments = await updateGoldPrices();
console.log("Updated all gold prices to current market rates");
```

### Import/Export Functions

```typescript
// Export gold investments to CSV
exportGoldInvestments(): void

// Download a sample CSV template
downloadGoldSample(): void

// Import gold investments from CSV/Excel file
importGoldInvestments(file: File): Promise<GoldInvestment[]>
```

## Error Handling

The service methods may throw the following errors:

- **Invalid File Error**: When importing a file with invalid format
- **Read Error**: When unable to read the import file
- **Market Price Error**: When unable to fetch current gold prices

## Usage Notes

1. Gold prices are automatically updated when retrieving all investments
2. Import/export functionality supports both CSV and Excel formats
3. Gold types affect pricing calculations (Physical gold has higher markup than Digital)
4. Each operation creates an audit record via the Audit Service

