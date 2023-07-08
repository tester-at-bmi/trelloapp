import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: '7vknyb',
  viewportHeight: 720,
  viewportWidth: 1280,
  fixturesFolder: 'cypress/fixtures',
	downloadsFolder: 'cypress/downloads',
	screenshotsFolder: 'cypress-report/screenshots',
	videosFolder: 'cypress-report/videos',
	screenshotOnRunFailure: true,
	videoUploadOnPasses: false,
  video: false,
  retries: {
    openMode: 0,
    runMode: 1,
  },
  reporter: 'cypress-multi-reporters',
	reporterOptions: {
		reporterEnabled: 'mochawesome, mocha-junit-reporter',
		mochawesomeReporterOptions: {
			reportDir: 'cypress-report/json',
			overwrite: false,
			html: false,
			json: true,
			timestamp: 'ddmmyyyy_HHMMss',
		},
		mochaJunitReporterReporterOptions: {
			mochaFile: 'cypress-report/junit/results-[hash].xml',
		},
	},
  experimentalWebKitSupport: true,
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/grep/src/plugin')(config);
      require('./cypress/plugins/index.ts')(on, config)
      return config;
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
  env: {
    coverage: false,
    grepOmitFiltered: true,
  },
})
