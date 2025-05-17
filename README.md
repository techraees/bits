# Developer Guide for BITS NFT

Welcome to the BITS NFT team! This guide will help you set up your development environment and understand the project's structure, including routing, assets, components, and configurations.

**Table of Contents**

1. [Installation](#setting-up-the-project)
2. [Project Structure](#project-structure)
3. [Code Quality and Standards](#code-quality-and-standards)
4. [GitHub Flow](#git-workflow)

## Prerequisites

Ensure you have the following installed:

-   **Node.js** (version 16 or later) and **npm** (version 7 or later)
-   **Git** for version control

## Setting Up the Project

### 1. Clone the Repository

Clone the repository to your local environment:

```bash
git clone https://github.com/snapboogie/bits.git
```

Navigate into the project directory:

```bash
cd bits
```

### 2. Install Dependencies

Install all project dependencies:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file using the `.env.example` as a template.

### 4. Start the Development Server

To start the development server, run:

```bash
npm start
```

## Project Structure

### File Extensions

-   **.jsx**: All React components should use the `.jsx` extension.

### Folders

-   **src/views/**: Contains `public` and `private` page views.
    -   **public/**: Publicly accessible views.
    -   **private/**: Views restricted to authenticated users.
-   **src/routes.js**: Manages all application routes.

#### **components/**

-   Hosts reusable UI components, structured as follows:
    -   Each component in a self-contained folder.
    -   Contains an `index.jsx` for component logic and a `css/` directory with `index.css` for styling.

#### **abis/**

-   Contains JavaScript files (`.js` extension) for smart contract ABIs essential for blockchain operations.

#### **assets/**

-   Holds assets organized into:
    -   **fonts/**: Font files.
    -   **icons/**: Icon graphics.
    -   **images/**: Image assets.
-   Each contains an `index.js` for easy resource exports.

#### **config/**

-   Configuration files for various services:
    -   **database/**: Database connection and configuration logic.
    -   **deepmotion/**: Logic specific to DeepMotion integrations.
    -   **Infura/**: Setup for Infura service interactions.
    -   **ipfsService/**: IPFS integration logic.
-   Each subdirectory includes an `index.js` to encapsulate the logic for its service.

#### **gql/**

-   Manages GraphQL queries and mutations:
    -   **queries.js**: Stores all GraphQL query definitions.
    -   **mutations.js**: Contains GraphQL mutation definitions.

#### **hooks/**

Houses custom hooks, such as `useProtectedRoutes.js`, which manages user authentication and route protection.

#### **store/**

This folder is structured to manage application state using Redux and contains the following subfolders:

-   **actions/**: Contains action creators responsible for dispatching actions that modify the store state.

-   **constants/**: Houses constant definitions and action types to maintain consistency across actions and reducers.

-   **reducer/**: Contains reducer functions that define how the Redux state changes in response to actions.

-   **slice/**: Implements Redux Toolkit slices. Each slice manages a state piece, simplified by combining reducers and actions.

### Routing Setup

Custom routing uses public and private layouts:

#### Routes File (`src/routes.js`)

### Overview

This file organizes routes into a cohesive structure, defining whether they are public or private, their paths, components, and other attributes, which are crucial for navigation and display in a React application.

### Key Components and Structure

1. **Import Statements**: At the beginning, you import necessary components and assets needed for routing and UI elements:

    - Components for various views (e.g., `Dashboard`, `Login`).
    - Icons or images from the assets (e.g., `home2`, `collection`).

2. **Route Definitions**: This is an array of route objects, each defining a route's configuration. Let's look at the properties:

    - **name**: Human-readable identifier for the route.
    - **layout**: Determines if a route is "public" or "private". This likely affects navigation logic and layout rendering.
    - **path**: The URL path where the route is accessible. Dynamic segments can be used (e.g., `:userId` in `/collections/:userId`).
    - **icon**: Associated icon for UI representation in navigation elements.
    - **component**: The React component to render for the given path.
    - **visible**: Indicates if the route should be visible, for instance, in the site's navigation.
    - **isNav**: Suggests if this route should be part of the navigation menu.
    - **key**: A unique identifier for the route, helpful in lists, mapping, and React components.
    - **belongsTo**: Specifies a category or group the route is part of (e.g., "Settings").
    - **nested**: Specifies if the route has nested child routes. If `true`, `nestedRoutes` holds the child route definitions.
    - **nestedRoutes**: Contains an array of sub-routes if `nested` is `true`. This facilitates complex routing (e.g., `Account Settings` with `Edit Profile` nested under it).

3. **Sample Routes**:

    - **Public Routes**:
        - **Home**: Accessible at `/`, with an icon and component `Dashboard`.
        - **Login**: Available at `/login`, no icon, and `Login` component.
    - **Private Routes**:
        - **My Collection**: Requires authentication, uses the path `/collections/:userId`, and has a component `Collections`.
        - **Account Settings**: Shows nested routing under `/account-settings`, enabling more granularity with paths like `/account-settings/edit-profile`.

4. **Routing Logic**:

    - **Public vs. Private**: This file, combined with layout components, likely utilizes logic (perhaps via context or higher-order components) to check if a user is authenticated and redirect accordingly. The route's `layout` property helps distinguish public routes from private ones.
    - **Accessibility**:
        - **Role of `isNav` and `visible`**: Controls appear both in the site's navigation structure and what users can access without specific permissions.

5. **Return Value**:
    - Finally, the `routes` array is exported, making it available for use in route rendering logic within the application, likely within a `Router` component setup in the top-level React component.

#### Private Layout (`src/views/private/index.js`)

Handles authenticated routes:

```javascript
<Routes>
	{routes
		?.filter((r) => r?.layout === "private")
		.map((route) => (
			<Route
				key={route.key}
				path={route?.path}
				element={<Protected>{route?.component}</Protected>}
			/>
		))}
</Routes>
```

#### Public Layout (`src/views/public/index.js`)

Manages public page routing:

```javascript
<Routes>
	{routes
		?.filter((r) => r?.layout === "public")
		.map((route) => (
			<Route
				key={route.key}
				path={route?.path}
				element={
					publicRoutes?.includes(location?.pathname) ? (
						<Public>{route?.component}</Public>
					) : (
						route?.component
					)
				}
			/>
		))}
</Routes>
```

## Code Quality and Standards

### Prettier: Automated Code Formatting

Prettier is a code formatter that ensures your code looks neat and consistent. In your `package.json`, the script related to Prettier is:

```json
"format": "prettier --write \"**/*.{js,jsx,json}\""
```

-   **What it does**: This command finds all files with the `.js`, `.jsx`, and `.json` extensions in your project and formats them according to the Prettier configuration. The `--write` flag rewrites the files with the formatted code.
-   **When it runs**: It is executed as part of the `start` script and also when `lint-staged` runs during a pre-commit hook.

### ESLint: Conducting Code Linting

ESLint checks your code for syntax and style errors based on defined rules.

-   **Scripts**:

    ```json
    "lint": "eslint src/**/*.{js,jsx}",
    "lint-fix": "eslint src/**/*.{js,jsx} --fix"
    ```

-   **What they do**:

    -   **`lint`**: This command runs ESLint to check for issues in all JavaScript and JSX files, reporting any problems but not fixing them automatically.
    -   **`lint-fix`**: Goes a step further by attempting to automatically fix any lint errors it finds, based on the available ESLint rules configured in your project.

-   **When they run**: These commands are triggered within the `start` script and through `lint-staged` during a pre-commit check.

### Husky: Pre-commit Hooks for Code Quality Checks

Husky is used to manage Git hooks in your project, ensuring specific tasks happen before making commits to your repository.

-   **Setup script**:

    ```json
    "prepare": "husky install"
    ```

    This ensures Husky is set up and ready to manage hooks when installing the project dependencies.

-   **Hook configuration**:

    ```json
    "hooks": {
      "pre-commit": "lint-staged && pretty-quick --staged"
    }
    ```

    -   **What it does**: This hook runs `lint-staged` to process only the staged files, formatting and lint-fixing them before a commit is finalized. `pretty-quick --staged` ensures the staged files are formatted with Prettier.

-   **Why it matters**: By using Husky to run these checks before committing, you prevent unformatted or non-compliant code from being pushed to the repository, thus maintaining code quality.

## Git Workflow

### 1. Branching

-   **Purpose**: Branching allows developers to work on features or fixes in isolation, without affecting the main codebase until everything is ready to merge.
-   **Naming Conventions**:
    -   `feature/feature-name`: Helps identify what the branch is about, making it easier to understand ongoing work. The branch name should be descriptive and succinct, reflecting the task or feature being implemented, such as `feature/login-page` or `feature/api-integration`.
    -   Other common types include `bugfix/issue-description`, `hotfix/urgent-fix`, `release/version-number`, and `experiment/test-concept`.

### 2. Committing

-   **Conventional Commits**: This is a specification for writing commit messages that are easy to read and understand. It helps keep the project history clean and informative.
-   **Guidelines**:
    -   Commit messages typically consist of:
        -   **Type**: e.g., `feat` for a new feature, `fix` for a bug fix.
        -   **Scope (optional)**: Part of the project the change affects, like `ui`, `api`.
        -   **Subject**: A short description of the change.
        -   **Body (optional)**: More detailed explanation; can include rationale, what was changed, and why.
        -   **Footer (optional)**: For issues or breaking changes.
    -   Example: `feat(login): add error messages for invalid credentials`.

### 3. Pull Requests

-   **Purpose**: Pull Requests (PRs) serve as a mechanism for code review and are a key part of collaboration in Git.
-   **Process**:
    -   **Create a PR**: After completing work on a branch, create a PR to merge changes into the main codebase (e.g., `main` or `develop`).
    -   **Code Review**: Team members or assigned reviewers evaluate the changes for quality, logic, and adherence to coding standards. They can suggest improvements and request changes.
    -   **Testing and Approval**: Ensure the new code does not break existing functionality and meets all requirements. Automated tests or checks might run as part of this process.
    -   **Merging**: After addressing any feedback and obtaining the necessary approvals, the PR is merged. This ensures that all code in the main branch is vetted, reducing the risk of introducing issues.
