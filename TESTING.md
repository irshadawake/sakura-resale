# Testing Guide - Sakura Resale Marketplace

## Prerequisites
- Backend running on `http://localhost:4000`
- Frontend running on `http://localhost:3000`
- MongoDB connected and running

## 1. Authentication Flow

### Register New User
1. Navigate to `http://localhost:3000/register`
2. Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
3. Click **Sign Up**
4. ✅ Should redirect to homepage with user logged in
5. ✅ Header should show user dropdown with name

### Login Existing User
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click **Sign In**
4. ✅ Should redirect to homepage
5. ✅ Header should display user name and dropdown menu

### Verify Authentication State
1. Click on user name in header
2. ✅ Dropdown should show:
   - Profile
   - My Listings
   - Favorites
   - Logout

### Logout
1. Click **Logout** from dropdown
2. ✅ Should redirect to homepage
3. ✅ Header should show "Login" and "Sign Up" buttons

## 2. Listing Management

### Create New Listing
1. Log in as a user
2. Navigate to `http://localhost:3000/listings/new`
3. Fill in the form:
   - **Title**: `Vintage Bicycle for Sale`
   - **Description**: `Well-maintained road bike, perfect for commuting.`
   - **Category**: Select from dropdown (e.g., `Sports & Outdoors`)
   - **Price/Free**:
     - Toggle OFF = Enter price: `15000`
     - Toggle ON = Free item
   - **Condition**: Select (e.g., `Used - Good`)
   - **Location**: Select prefecture (e.g., `Tokyo`)
   - **Images**: Upload 1-5 images (optional for testing)
4. Click **Create Listing**
5. ✅ Should show success message: "Listing created successfully!"
6. ✅ Should redirect to My Listings page

### View My Listings
1. Navigate to `http://localhost:3000/listings/my-listings`
2. ✅ Should display all your listings (active, sold, inactive)
3. ✅ Each listing card should show:
   - Title
   - Price or "Free"
   - Category
   - Status badge (Active/Sold/Inactive)
   - Edit and Delete buttons

### Edit Listing
1. From My Listings page, click **Edit** on any listing
2. Modify any fields (e.g., change price or description)
3. Click **Update Listing**
4. ✅ Should show success message
5. ✅ Changes should be reflected immediately

### Delete Listing
1. From My Listings page, click **Delete** on any listing
2. ✅ Listing should be removed from the list
3. ✅ Should show success message

### Empty State
1. Delete all your listings
2. Navigate to `http://localhost:3000/listings/my-listings`
3. ✅ Should show: "You haven't created any listings yet"

## 3. Protected Routes

### Test Authentication Guard
1. Log out
2. Try to access `http://localhost:3000/listings/new`
3. ✅ Should redirect to login page
4. Try to access `http://localhost:3000/listings/my-listings`
5. ✅ Should redirect to login page

## 4. Error Scenarios

### Invalid Login
1. Navigate to login page
2. Enter invalid credentials
3. ✅ Should show error message: "Invalid credentials"

### Duplicate Email Registration
1. Try to register with an existing email
2. ✅ Should show error message

### Form Validation
1. On Create Listing page, leave required fields empty
2. Click **Create Listing**
3. ✅ Should show validation errors

### Network Issues
1. Stop the backend server
2. Try to create a listing or login
3. ✅ Should show error message: "Failed to create listing" or "Login failed"

## 5. Data Persistence

### Refresh Browser
1. Log in and create a listing
2. Refresh the page
3. ✅ Should remain logged in
4. ✅ Listing should still appear in My Listings

### Session Persistence
1. Log in
2. Close browser tab
3. Reopen `http://localhost:3000`
4. ✅ Should still be logged in (check local storage for token)

## Backend API Testing (Optional)

### Health Check
```bash
curl http://localhost:4000/api/health
```
✅ Should return: `{"status":"ok"}`

### Register User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test","email":"apitest@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"apitest@example.com","password":"password123"}'
```
✅ Should return JWT token

### Get User Listings
```bash
curl http://localhost:4000/api/users/listings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Known Issues & Notes

- **Mock Data**: Homepage still uses mock data for categories and featured listings (backend integration pending)
- **Image Upload**: Image upload may require additional backend configuration for file storage
- **Categories**: Categories are fetched from backend in Create/Edit Listing forms
- **Japanese Prefectures**: Location dropdown uses hardcoded list of 47 Japanese prefectures

## Success Criteria

✅ All authentication flows work without errors  
✅ Users can create, view, edit, and delete listings  
✅ Protected routes redirect unauthenticated users  
✅ Error messages display appropriately  
✅ UI reflects authentication state correctly  
✅ Data persists across page refreshes  

---

**Last Updated**: Today  
**Backend**: Node.js + Express + MongoDB  
**Frontend**: Next.js 14 + TypeScript + Zustand  
**Authentication**: JWT-based
