module.exports = {
  id: 'aurora_tide_design_system',
  viewports: [
    {
      label: 'phone',
      width: 375,
      height: 667
    },
    {
      label: 'tablet',
      width: 1024,
      height: 768
    },
    {
      label: 'desktop',
      width: 1920,
      height: 1080
    }
  ],
  scenarios: [
    {
      label: 'Home Page',
      url: 'http://localhost:5000/',
      delay: 1000,
      misMatchThreshold: 0.1
    },
    {
      label: 'City Group (Lisbon)',
      url: 'http://localhost:5000/city/lisbon',
      selectors: ['.city-hero', '.event-feed', '.housing-cards'],
      delay: 1000,
      misMatchThreshold: 0.1
    },
    {
      label: 'Housing Marketplace',
      url: 'http://localhost:5000/housing',
      selectors: ['viewport'],
      delay: 1000,
      misMatchThreshold: 0.1
    }
  ],
  paths: {
    bitmaps_reference: 'backstop_data/bitmaps_reference',
    bitmaps_test: 'backstop_data/bitmaps_test',
    engine_scripts: 'backstop_data/engine_scripts',
    html_report: 'backstop_data/html_report',
    ci_report: 'backstop_data/ci_report'
  },
  report: ['browser', 'CI'],
  engine: 'puppeteer',
  engineOptions: {
    args: ['--no-sandbox']
  },
  asyncCaptureLimit: 5,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false
};
