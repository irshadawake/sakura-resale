# Bundle Sale Feature

## Overview
The Bundle Sale category allows users to sell multiple items together, perfect for moving out, decluttering, or estate sales.

## Database Schema

### New Columns in `listings` table:
- `is_bulk_sale` (BOOLEAN, default: FALSE) - Indicates if listing contains multiple items
- `bulk_items_description` (TEXT) - Detailed list of items included in the sale
- `price_per_item` (BOOLEAN, default: FALSE) - Pricing strategy indicator

## How It Works

### Pricing Models
1. **Single Price for All Items** (`price_per_item = FALSE`)
   - User sets one price for the entire bulk
   - Example: "All items for ¥50,000"
   
2. **Price Per Item** (`price_per_item = TRUE`)
   - User sets price, indicates it's per item
   - Example: "¥2,000 per item" (10 items = ¥20,000 total)

### Creating a Bundle Sale Listing

#### Example 1: Moving Out Sale
```json
{
  "category_id": "f5d7e8f7-e6ed-4828-8971-d3f2ec27a776",
  "title": "Moving Out - Entire Apartment Furniture",
  "description": "Leaving Japan, selling everything",
  "price": 80000,
  "is_bulk_sale": true,
  "price_per_item": false,
  "bulk_items_description": "Queen bed with mattress, 2-seater sofa, dining table with 4 chairs, TV stand, desk, bookshelf, microwave, rice cooker, vacuum cleaner"
}
```

#### Example 2: Declutter Sale
```json
{
  "category_id": "f5d7e8f7-e6ed-4828-8971-d3f2ec27a776",
  "title": "Kitchen Items Bundle Sale",
  "description": "Downsizing - various kitchen items",
  "price": 5000,
  "is_bulk_sale": true,
  "price_per_item": true,
  "bulk_items_description": "Pots (3), Pans (2), Plates set, Bowls set, Cutlery set, Glasses (6)"
}
```

## UI/UX Features

### Display
- Bundle Sale category has special orange highlight
- Listings show badge "BUNDLE SALE" 
- Items list displayed prominently
- Clear pricing information (total vs per item)

### Benefits for Users
1. **Sellers**: Faster sales, less hassle, sell everything at once
2. **Buyers**: Good deals, complete sets, one-stop shopping

## Implementation Status

### ✅ Completed
- Database schema updated
- Categories created (Bundle Sale, Houses & Apartments, Jobs & Services)
- Category icons and styling added
- Backend support for bundle sale fields

### 🔄 To Implement
- Update create listing form to support bundle sale fields
- Add UI toggle for "Is this a bundle sale?"
- Add textarea for bulk items description
- Add toggle for pricing model (total vs per item)
- Display bundle sale badge on listing cards
- Show items list in listing detail page

## Future Enhancements
- Allow sellers to upload multiple images per item in bulk
- Add item-by-item breakdown with individual pricing
- Enable partial purchase (if seller agrees)
- Add templates for common bundle sale scenarios
