#!/usr/bin/env node
const rimraf = require('rimraf');

const testResultsDir = 'cypress-report';

rimraf(testResultsDir, () => {
	console.log('Deleted former test results.');
});
