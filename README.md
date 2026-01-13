# Court Case Reminder App - Vakil Edition

A React-based court case management application for lawyers (Vakils) with persistent local storage.

## Features

- ✅ **Case Dashboard**: View all cases in a table format
- ✅ **Add New Cases**: Form to add case details
- ✅ **Move to Next Hearing**: Automatically move hearing date to next month
- ✅ **Reminder Section**: View upcoming hearings with 7-day urgent highlighting
- ✅ **Search & Filter**: Search by case number/client name, filter by court/type
- ✅ **Persistent Storage**: All data saved locally using localStorage
- ✅ **Responsive Design**: Works on mobile phones and desktop

## How localStorage Works

### What is localStorage?

`localStorage` is a browser API that allows web applications to store data locally on the user's device. Unlike session storage, data in localStorage persists even after:
- Closing the browser
- Refreshing the page
- Restarting the device

### Key localStorage Methods

1. **`localStorage.setItem(key, value)`**
   - Saves data to localStorage
   - Both key and value must be strings
   - Example: `localStorage.setItem('name', 'John')`

2. **`localStorage.getItem(key)`**
   - Retrieves data from localStorage
   - Returns the value as a string, or `null` if not found
   - Example: `const name = localStorage.getItem('name')`

3. **`localStorage.removeItem(key)`**
   - Deletes a specific item from localStorage
   - Example: `localStorage.removeItem('name')`

4. **`localStorage.clear()`**
   - Clears all data from localStorage
   - Example: `localStorage.clear()`

### Storing Objects/Arrays

Since localStorage only stores strings, we need to convert objects/arrays:

**Saving (Object → String):**
```javascript
const cases = [{ id: 1, name: 'Case 1' }];
localStorage.setItem('cases', JSON.stringify(cases));
```

**Loading (String → Object):**
```javascript
const stored = localStorage.getItem('cases');
const cases = JSON.parse(stored); // Convert back to array
```

### How This App Uses localStorage

1. **On App Load**: 
   - `useEffect` hook runs once when component mounts
   - Calls `loadCasesFromStorage()` to retrieve saved cases
   - Parses JSON string back to array

2. **On Data Change**:
   - Another `useEffect` watches the `cases` state
   - Whenever cases change, it automatically saves to localStorage
   - Converts array to JSON string before saving

3. **Data Persistence**:
   - All case data is stored under key `'courtCases'`
   - Data persists across browser sessions
   - Each user's device has its own separate data

## Installation & Setup

### Option 1: Simple HTML Setup (Current)

1. Open `index.html` in a web browser
2. The app will load using CDN links for React

### Option 2: Using Create React App

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Usage

1. **Add a Case**: Click "Add New Case" button and fill in the form
2. **View Cases**: All cases appear in the dashboard table
3. **Search**: Use the search box to find cases by number or client name
4. **Filter**: Use dropdowns to filter by court or case type
5. **Move Hearing**: Click "Next" button to move hearing to next month
6. **View Reminders**: Switch to "Reminders" tab to see upcoming hearings
7. **Urgent Cases**: Cases within 7 days are highlighted in red

## Case Fields

- **Case Number**: Unique identifier for the case
- **Court Name**: Name of the court
- **Case Type**: Civil, Criminal, Family, or Property
- **Client Name**: Name of your client
- **Opponent Name**: Name of opposing party (optional)
- **Current Hearing Date**: Next scheduled hearing date
- **Case Status**: Pending, Adjourned, or Closed
- **Notes/Arguments**: Additional case details

## Data Storage

- All data is stored locally on your device
- No data is sent to any server
- Data is specific to each browser/device
- To clear data, use browser's developer tools: `localStorage.clear()`

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Code Structure

- **App.js**: Main React component with all logic
- **styles.css**: All styling and responsive design
- **index.html**: HTML entry point
- **package.json**: Dependencies and scripts

## Technologies Used

- React 18 (Functional Components & Hooks)
- localStorage API
- Vanilla CSS (No frameworks)
- Babel (for JSX transformation)

## Notes

- This is a client-side only application
- No backend server required
- Data persists locally per device
- Perfect for offline use
