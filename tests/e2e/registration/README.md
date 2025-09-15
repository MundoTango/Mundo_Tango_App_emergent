# Mundo Tango Registration Flow Tests

## Overview
Comprehensive E2E test suite for the Mundo Tango 5-step registration flow, implementing best practices for accessibility, visual regression, and mobile responsiveness testing.

## Test Structure

### Page Object Models
Located in `tests/e2e/pages/registration/`:
- `CreateAccountPage.ts` - Step 1: Account creation
- `ProfileDetailsPage.ts` - Step 2: Profile information  
- `DancePreferencesPage.ts` - Step 3: Tango experience
- `LocationSetupPage.ts` - Step 4: Location and hosting
- `WelcomeTutorialPage.ts` - Step 5: Onboarding tutorial

### Test Files
- `registration-flow.e2e.test.ts` - Main registration flow tests (228 tests across browsers/devices)
- `registration-validation.e2e.test.ts` - Edge cases and validation tests (126+ tests)

## Test Coverage

### 1. Complete Registration Flow
- ✅ Happy path through all 5 steps
- ✅ Step navigation (back/forward)
- ✅ Skip optional steps functionality
- ✅ Data persistence between steps
- ✅ Session storage maintenance

### 2. Form Validation
- ✅ Email format validation
- ✅ Username availability checks
- ✅ Password strength indicators
- ✅ Phone number validation
- ✅ Birth date validation
- ✅ Character limits enforcement
- ✅ Required field validation
- ✅ Social media handle formatting

### 3. Accessibility Testing
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader announcements
- ✅ ARIA attributes validation
- ✅ Form labels and descriptions
- ✅ Focus indicators
- ✅ Heading hierarchy
- ✅ Color contrast checks

### 4. Visual Regression
- ✅ Percy snapshots for each step
- ✅ Dark mode testing
- ✅ Responsive viewport testing
- ✅ Loading state captures
- ✅ Error state screenshots
- ✅ Success state visuals

### 5. Mobile Responsiveness
Tests across multiple devices:
- ✅ iPhone 12
- ✅ iPad
- ✅ Pixel 7  
- ✅ Galaxy S20
- ✅ Custom viewport sizes (375px to 2560px)

### 6. Error Handling
- ✅ Network failures
- ✅ Server validation errors
- ✅ API timeouts
- ✅ Duplicate registration attempts
- ✅ Invalid geolocation

### 7. Performance Testing
- ✅ Page load metrics
- ✅ Form interaction responsiveness
- ✅ Memory leak detection
- ✅ Bundle size monitoring

## Running the Tests

### Run all registration tests:
```bash
npm run test:e2e -- tests/e2e/registration/
```

### Run specific test file:
```bash
npm run test:e2e -- tests/e2e/registration/registration-flow.e2e.test.ts
```

### Run with UI mode for debugging:
```bash
npm run test:e2e:ui -- tests/e2e/registration/
```

### Run specific test by name:
```bash
npm run test:e2e -- -g "Complete registration flow"
```

### Run on specific browser:
```bash
npm run test:e2e -- --project="Desktop Chrome" tests/e2e/registration/
```

## Test Data Management

### Test User Generation
Each test generates unique user data with timestamps to avoid conflicts:
- Username: `test_user_${Date.now()}`
- Email: `test.${Date.now()}@example.com`

### Mock Data
- Test avatar images generated programmatically
- Geolocation mocked for Buenos Aires (-34.6037, -58.3816)
- API responses mocked for username availability

## Key Features

### Data Test IDs
All interactive elements use consistent `data-testid` attributes:
- Inputs: `input-{field-name}`
- Buttons: `button-{action}`
- Checkboxes: `checkbox-{option}`
- Selects: `select-{field}`
- Containers: `{component}-container`

### Accessibility Helpers
Comprehensive accessibility testing utilities:
- `runAccessibilityScan()` - Full page scan
- `assertNoA11yViolations()` - Fail on violations
- `checkKeyboardNavigation()` - Tab order testing
- `checkFormLabels()` - Label association
- `generateA11yReport()` - JSON reports

### Visual Regression Helpers
Percy and Playwright screenshot utilities:
- `takePercySnapshot()` - Cloud visual diffs
- `stabilizePage()` - Wait for stability
- `takeResponsiveScreenshots()` - Multi-viewport
- `testDarkMode()` - Theme testing
- `hideDynamicElements()` - Remove timestamps

## CI/CD Integration

### Environment Variables
Required for full test execution:
- `DATABASE_URL` - Test database
- `PERCY_TOKEN` - Visual regression (optional)
- `TEST_BASE_URL` - Application URL

### Parallel Execution
Tests run in parallel across:
- 4 browsers (Chrome, Firefox, Safari, Edge)
- 4 mobile devices
- Multiple viewport sizes

### Test Reports
Generated in `test-results/`:
- HTML report with screenshots
- JSON accessibility reports
- Visual regression diffs
- Performance metrics

## Maintenance

### Adding New Tests
1. Create page object if needed
2. Add test in appropriate describe block
3. Use existing helpers and patterns
4. Include accessibility checks
5. Add visual snapshots
6. Test on mobile viewports

### Updating Selectors
1. Update page object locators
2. Maintain data-testid convention
3. Run tests to verify changes
4. Update visual baselines if needed

### Debugging Failures
1. Use `--debug` flag for step-through
2. Check screenshots in test-results
3. Review accessibility reports
4. Compare visual diffs in Percy
5. Check browser console logs

## Test Metrics

### Coverage Statistics
- **Total Tests**: 354+ test cases
- **Browsers**: 4 (Chrome, Firefox, Safari, Edge)
- **Devices**: 4 mobile configurations
- **Accessibility Rules**: 50+ WCAG checks
- **Visual Snapshots**: 25+ per run
- **Average Runtime**: ~5 minutes parallel

### Success Criteria
- ✅ 100% form validation coverage
- ✅ 0 critical accessibility violations
- ✅ <100ms input responsiveness
- ✅ <3s page load time
- ✅ Mobile-first responsive design
- ✅ Cross-browser compatibility

## Troubleshooting

### Common Issues

#### Percy snapshots not captured
- Ensure `PERCY_TOKEN` is set
- Check Percy project exists
- Verify network connectivity

#### Accessibility violations
- Review generated reports
- Check color contrast ratios
- Verify ARIA attributes
- Test with screen reader

#### Flaky tests
- Increase wait timeouts
- Add stability checks
- Use proper wait conditions
- Mock external dependencies

#### Mobile tests failing
- Verify viewport sizes
- Check touch event handling
- Test responsive breakpoints
- Review mobile-specific UI

## Future Enhancements
- [ ] Add API integration tests
- [ ] Implement load testing
- [ ] Add i18n testing
- [ ] Enhance performance metrics
- [ ] Add security testing
- [ ] Implement visual AI testing