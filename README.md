# Team Required setup and HOWTO

1. Clone the project: Open the terminal in (VS code) and run:

git clone https://github.com/amat-49/FP-calculator.git

cd FP-calculator

2. Install Dependencies: This command will automatically install React, Vite, Vitest, and the Testing Library items we use in the code:

npm install

3. Run the App

npm run dev

*You can then open the local URL (usually http://localhost:5173) provided in the terminal to see the calculator

4. Run the tests
To make sure the math logic is working on their machine:

npm test

------------------------------------------------------------

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
