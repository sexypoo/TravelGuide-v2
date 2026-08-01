const fs = require('node:fs');
const path = require('node:path');
const { createCoverageMap } = require('istanbul-lib-coverage');
const { createContext } = require('istanbul-lib-report');
const reports = require('istanbul-reports');

const root = path.resolve(__dirname, '..');
const coverageMap = createCoverageMap({});

for (const suite of ['unit', 'integration']) {
  const file = path.join(root, 'coverage', suite, 'coverage-final.json');
  coverageMap.merge(JSON.parse(fs.readFileSync(file, 'utf8')));
}

const outputDirectory = path.join(root, 'coverage', 'combined');
const context = createContext({ dir: outputDirectory, coverageMap });
reports.create('text-summary').execute(context);
reports.create('json-summary').execute(context);

const thresholds = {
  statements: 80,
  branches: 60,
  functions: 75,
  lines: 80,
};
const summary = coverageMap.getCoverageSummary().toJSON();
const failures = Object.entries(thresholds).filter(
  ([metric, minimum]) => summary[metric].pct < minimum,
);

if (failures.length > 0) {
  for (const [metric, minimum] of failures) {
    console.error(
      `Coverage threshold failed: ${metric} ${summary[metric].pct}% < ${minimum}%`,
    );
  }
  process.exitCode = 1;
}
