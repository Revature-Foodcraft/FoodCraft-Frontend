# FoodCraft Frontend

This is the frontend repository for the **FoodCraft** application, a platform for creating, saving, and sharing recipes. The application also includes features like macro tracking, smart fridge management, and user reviews.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Folder Structure](#folder-structure)
- [Testing](#testing)
- [Contributing](#contributing)
- [Backend Repository](#backend-repository)

---

## Features

- **Recipe Management**: Create, save, and view recipes with detailed instructions, ingredients, and macros.
- **Macro Tracker**: Track daily macros and set goals for protein, carbs, fats, and calories.
- **Smart Fridge**: Manage ingredients and track their availability.
- **User Reviews**: Add and view reviews for recipes.
- **Authentication**: Google OAuth integration for user login and profile management.
- **Responsive Design**: Optimized for both desktop and mobile devices.

---

## Technologies Used

- **Frontend Framework**: React with TypeScript
- **Styling**: CSS Modules, Bootstrap
- **Routing**: React Router
- **State Management**: React Context API
- **Build Tool**: Vite
- **Testing**: Jest, React Testing Library

---

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/FoodCraft-Frontend.git
   cd FoodCraft-Frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the application in your browser at `http://localhost:5173`.

---

## Folder Structure

```
src/
├── Components/         # Reusable React components
├── Pages/              # Page-level components
├── css/                # CSS files for styling
├── __tests__/          # Unit and integration tests
├── assets/             # Static assets (images, videos, etc.)
├── App.tsx             # Main application component
├── main.tsx            # Entry point for the application
├── vite-env.d.ts       # TypeScript environment definitions
```

---

## Testing

Run the test suite using Jest:

```bash
npm test
```

### Test Coverage

- Unit tests for components and hooks
- Integration tests for pages and features
- Mocked API calls for isolated testing

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and push the branch:
   ```bash
   git push origin feature-name
   ```
4. Open a pull request on GitHub.

---

## Backend Repository

The backend repository for this project can be found [here](https://github.com/Revature-Foodcraft/FoodCraft-Backend).
