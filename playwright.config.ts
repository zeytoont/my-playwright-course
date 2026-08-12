import { defineConfig, devices } from '@playwright/test';

/* ========================================================================== */
/* 🏢 CENTRALIZED FRAMEWORK VARIABLES                                         */
/* ========================================================================== */
/**
 * BUILD_NUMBER: Change this version variable when a new build is deployed to QA.
 */
const BUILD_NUMBER = '3108'; 

/**
 * Playwright Configuration File: Cloud Pipeline & CI-Ready Setup
 * This file dynamically scales its performance and robustness depending on
 * whether it detects a local developer environment or a remote CI container.
 */
export default defineConfig({
  /* ========================================================================== */
  /* 1. STRUCTURAL & DIRECTORY MANAGEMENT                                       */
  /* ========================================================================== */

  testDir: './tests',

  /* Run tests in files in parallel across available CPU cores */
  fullyParallel: true,

  /**
   * forbidOnly: Fails the build if 'test.only' is accidentally left in code.
   * On CI, this ensures developers don't accidentally skip the entire suite.
   */
  forbidOnly: !!process.env.CI, 

  /* ========================================================================== */
  /* 2. ADAPTIVE TIMING, TIMEOUTS, AND RETRIES (THE CI UPGRADE)                 */
  /* ========================================================================== */

  /* Global Test Timeout: Absolute master switch limit for a single test block */
  timeout: 30000, // 30 seconds

  /**
   * retries: Aggressive retry tracking.
   * If on CI, retry 2 times to filter out cloud network drops.
   * If running locally, retry only 1 time for rapid debugging.
   */
  retries: process.env.CI ? 2 : 1,

  /**
   * workers: Concurrency and memory bottleneck management.
   * If on CI, force a single worker (1) to prevent Out-Of-Memory server crashes.
   * If running locally, use 'undefined' to exploit all computer CPU cores.
   */
  workers: process.env.CI ? 1 : undefined,

  /* ========================================================================== */
  /* 3. ASSERTION LEVEL TIMEOUTS                                                */
  /* ========================================================================== */
  expect: {
    /* Maximum time Web-First Assertions poll the DOM before throwing an error */
    timeout: 5000, 
  },

  /* Reporter to use. Generates an asset dashboard for local or server review */
  reporter: 'html',

  /* ========================================================================== */
  /* 4. ACTION & INTERACTION TIMEOUTS                                           */
  /* ========================================================================== */
  use: {
    /* Base URL pointed to your school LMS environment */
    baseURL: `https://qa.hitekschool.com/lms/`,

    /* Maximum time allowed for individual explicit steps (clicks, fills) */
    actionTimeout: 10000, // 10 seconds 

    /* Maximum time allowed for explicit page loading and route events */
    navigationTimeout: 15000, // 15 seconds

    /**
     * trace: Collect trace viewer files for structural analysis.
     * On CI, save space by tracing only on the first retry of a failing test.
     * Locally, developers can adjust this behavior as needed.
     */
    trace: 'on-first-retry',
    
    /* Capture visual evidence automatically to review errors in server logs */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configure projects for major cross-browser testing across environments */
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