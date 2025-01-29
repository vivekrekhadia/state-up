# state-up

A CLI tool to quickly set up state management in your React projects. Currently supports Redux Toolkit integration for both Next.js and Vite projects, with TypeScript and JavaScript support.

## Installation

```bash
npm install -g state-up
```

Or use it directly with npx:

```bash
npx state-up add redux
```

## Features

- 🚀 Quick setup of Redux Toolkit in React projects
- 🔄 Automatic project structure detection
- 📦 Automatic dependency installation
- 🎯 Support for both Next.js and Vite
- 💪 TypeScript and JavaScript support
- 📁 Generates a complete Redux setup with examples

## Usage

Navigate to your React project directory and run:

```bash
npx state-up add redux
```

The CLI will:

1. Detect your project structure (Next.js/Vite)
2. Detect your preferred language (TypeScript/JavaScript)
3. Install required dependencies
4. Create Redux configuration files
5. Provide integration instructions

## Generated Files

The tool creates the following structure in your project:

```
src/
  store/
    store.ts         # Redux store configuration
    counterSlice.ts  # Example slice with counter implementation
    provider.tsx     # Redux Provider component
```

## Integration

### Next.js

In your `src/app/layout.tsx` or `pages/_app.tsx`:

```tsx
import { ReduxProvider } from "./store/provider";

export default function RootLayout({ children }) {
  return <ReduxProvider>{children}</ReduxProvider>;
}
```

### Vite

In your `src/main.tsx` or `src/main.jsx`:

```tsx
import { ReduxProvider } from "./store/provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider>
      <App />
    </ReduxProvider>
  </React.StrictMode>
);
```

## Using Redux in Components

```tsx
import { useSelector, useDispatch } from "react-redux";
import { increment } from "./store/counterSlice";

export function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return <button onClick={() => dispatch(increment())}>Count is {count}</button>;
}
```

## Requirements

- Node.js 16 or higher
- React project (Next.js or Vite)

## Supported Package Managers

- npm
- yarn
- pnpm

## License

MIT

## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## Author

Vivek Rekhadia

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
