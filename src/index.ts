#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

async function installDependencies(packageManager: "npm" | "yarn" | "pnpm") {
  const spinner = ora("Installing dependencies...").start();
  try {
    const installCommand = {
      npm: `npm install`,
      yarn: `yarn add`,
      pnpm: `pnpm add`,
    }[packageManager];

    execSync(installCommand, { stdio: "pipe" });
    spinner.succeed("Dependencies installed successfully!");
  } catch (error) {
    spinner.fail("Failed to install dependencies");
    throw error;
  }
}

program.name("state-up").description("CLI to add state management to your React project").version("1.0.1");

program
  .command("add")
  .argument("<manager>", "state manager to add (redux)")
  .action(async (manager) => {
    if (manager.toLowerCase() !== "redux") {
      console.log(chalk.red("Currently only Redux is supported"));
      process.exit(1);
    }

    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "framework",
        message: "Which framework are you using?",
        choices: ["Vite", "Next.js"],
      },
      {
        type: "list",
        name: "language",
        message: "Which language are you using?",
        choices: ["TypeScript", "JavaScript"],
      },
    ]);

    const spinner = ora("Setting up Redux...").start();

    try {
      // Check if package.json exists
      if (!fs.existsSync("package.json")) {
        throw new Error("package.json not found. Are you in the correct directory?");
      }

      // Read package.json
      const packageJson = await fs.readJSON("package.json");

      // Add Redux dependencies
      const dependencies = {
        "@reduxjs/toolkit": "^2.0.1",
        "react-redux": "^9.0.4",
      };

      packageJson.dependencies = {
        ...packageJson.dependencies,
        ...dependencies,
      };

      // Write updated package.json
      await fs.writeJSON("package.json", packageJson, { spaces: 2 });

      await installDependencies("npm");
      // Create Redux files
      const srcDir = answers.framework.toLowerCase() === "next.js" ? "app" : "src";
      await fs.ensureDir(srcDir);

      // Create store directory
      const storeDir = path.join(srcDir, "store");
      await fs.ensureDir(storeDir);

      // Create store files
      const extension = answers.language === "TypeScript" ? ".ts" : ".js";

      // Create store.ts/js
      const storeContent =
        answers.language === "TypeScript" ? await createTypeScriptStore() : await createJavaScriptStore();

      await fs.writeFile(path.join(storeDir, `store${extension}`), storeContent);

      // Create example slice
      const sliceContent =
        answers.language === "TypeScript" ? await createTypeScriptSlice() : await createJavaScriptSlice();

      await fs.writeFile(path.join(storeDir, `counterSlice${extension}`), sliceContent);

      // Create provider wrapper
      const providerContent =
        answers.language === "TypeScript" ? await createTypeScriptProvider() : await createJavaScriptProvider();

      await fs.writeFile(path.join(storeDir, `provider${extension}x`), providerContent);

      spinner.succeed("Redux setup completed successfully!");
      console.log(chalk.green("\nNext steps:"));
      console.log("1. Run npm install or yarn install to install the new dependencies");
      console.log("2. Import and use the Provider component in your root app file");
      console.log("3. Start using Redux in your components!");
    } catch (error) {
      spinner.fail("Failed to setup Redux");
      console.error(chalk.red(error instanceof Error ? error.message : "An unknown error occurred"));
      process.exit(1);
    }
  });

async function createTypeScriptStore(): Promise<string> {
  return `import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`;
}

async function createJavaScriptStore(): Promise<string> {
  return `import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
`;
}

async function createTypeScriptSlice(): Promise<string> {
  return `import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
`;
}

async function createJavaScriptSlice(): Promise<string> {
  return `import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
`;
}

async function createTypeScriptProvider(): Promise<string> {
  return `import { Provider } from 'react-redux';
import { store } from './store';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: Props) {
  return <Provider store={store}>{children}</Provider>;
}
`;
}

async function createJavaScriptProvider(): Promise<string> {
  return `import { Provider } from 'react-redux';
import { store } from './store';
import React from 'react';

export function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
`;
}

program.parse();
