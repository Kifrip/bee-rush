export default {
  timeout: 30000,
  outputDir: "qa/test-results",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    launchOptions: { args: ["--no-sandbox", "--disable-dev-shm-usage"] },
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1080 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 393, height: 851 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "npm run preview",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
};
