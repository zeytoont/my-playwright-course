import { defineConfig, devices } from '@playwright/test';

/* ========================================================================== */
/* 🏢 CENTRALIZED FRAMEWORK VARIABLES                                         */
/* ========================================================================== */
/**
 * BUILD_NUMBER: Change this version variable when a new build is deployed to QA.
 * Centralizing this at the top of your configuration prevents you from having to
 * manually hunt down and change URLs across dozens of different individual test files.
 */
const BUILD_NUMBER = '3108';

/**
 * Playwright Configuration File: Local Timing & Execution Control Blueprint
 * This file serves as the basis for Chapter 13.3, establishing the core timing
 * properties required to run stable automation suites locally.
 */
export default defineConfig({
  /* ========================================================================== */
  /* 1. STRUCTURAL & DIRECTORY MANAGEMENT                                       */
  /* ========================================================================== */

  /**
   * testDir: Maps the primary location where Playwright scans for test files.
   * Enforces code organization by separating test scripts from Page Objects.
   */
  testDir: './tests',

  /* Run tests in files in parallel across available local CPU cores */
  fullyParallel: true,

  /* Fail the build if a developer accidentally leaves 'test.only' in the code */
  forbidOnly: false, // 💡 Note: Will be automated using process.env.CI in the CI/CD chapter

  /* ========================================================================== */
  /* 2. TIMING, TIMEOUTS, AND RETRIES (CORE CHAPTER 13.3)                       */
  /* ========================================================================== */

  /**
   * timeout: The Global Test Timeout (The Outer Box).
   * Sets the absolute maximum limit for an entire single test block (in milliseconds).
   * If exceeded, the test runner triggers a hard kill switch.
   */
  timeout: 30000, // 30 seconds

  /**
   * retries: Isolates structural test flakiness.
   * Sets the number of times Playwright immediately re-runs a failed test file.
   * Hardcoded to 1 here so students can observe the "Flaky" status locally.
   */
  retries: 1, // 💡 Hardcoded for local mastery: Replaces "process.env.CI ? 2 : 0" for this chapter

  /**
   * workers: Sets the number of concurrent execution threads.
   * Passing 'undefined' tells Playwright to automatically optimize speed by
   * leveraging all available local CPU cores.
   */
  workers: undefined, // 💡 Hardcoded for local mastery: Replaces "process.env.CI ? 1 : undefined"

  /* ========================================================================== */
  /* 3. ASSERTION LEVEL TIMEOUTS                                                */
  /* ========================================================================== */
  expect: {
    /**
     * timeout: Expect Assertion Timeout.
     * The maximum time a Web-First Assertion (e.g., expect(locator).toBeVisible())
     * will poll the DOM before throwing an error. Uses intelligent micro-polling.
     */
    timeout: 5000, // 5 seconds (Default value, explicitly declared for student clarity)
  },

  /* Reporter to use. Generates a local interactive browser dashboard. */
  reporter: 'html',

  /* ========================================================================== */
  /* 4. ACTION & INTERACTION TIMEOUTS                                           */
  /* ========================================================================== */
  use: {
    /**
     * baseURL: Base URL to use in actions like `await page.goto('/')`.
     * Dynamically appends the centralized build number variable, resolving to
     * 'https://qa.hitekschool.com/lms/3108/'.
     */
    baseURL: `https://qa.hitekschool.com/lms/${BUILD_NUMBER}/`,

    /**
     * actionTimeout: Maximum time allowed for individual explicit browser steps.
     * Examples: await page.click(), await page.fill(), await page.hover().
     * If an element is blocked or slow to render, the step waits up to this limit.
     */
    actionTimeout: 10000, // 10 seconds (Upgraded from the default '0' no-limit boundary)

    /**
     * navigationTimeout: Maximum time allowed for explicit page loading events.
     * Examples: await page.goto(), await page.waitForURL().
     */
    navigationTimeout: 15000, // 15 seconds

    /* Collect trace when retrying a failed test to capture logs and snapshots */
    trace: 'on-first-retry',

    /* Capture visual test evidence automatically on failures */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Use a large, fixed viewport so tests run consistently regardless of your screen size */
    viewport: { width: 1920, height: 1080 },
  },

  /* Configure projects for major browsers to ensure cross-browser test coverage */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});