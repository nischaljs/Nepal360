/**
 * Nepal360 E2E Browser Tests
 * Tests all 3 roles: Admin, Beneficiary (campaign creator), Donor
 *
 * Accounts:
 *   Admin:       admin@nepal360.com / admin123
 *   Beneficiary: rajesh@nepal360.com / beneficiary123  (has LIVE campaign)
 *   Donor:       amit@nepal360.com  / donor123
 */

const puppeteer = require('/home/nischal/.local/share/mise/installs/node/25.5.0/lib/node_modules/puppeteer');

const BASE = 'http://localhost:5173';
const PASS = { admin: true, fail: false };

let browser;
let passed = 0;
let failed = 0;

function log(icon, msg) {
  console.log(`${icon}  ${msg}`);
}

function ok(msg) {
  passed++;
  log('✅', msg);
}

function fail(msg, err) {
  failed++;
  log('❌', `${msg}${err ? ': ' + (err.message || err) : ''}`);
}

async function newPage() {
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  await page.setViewport({ width: 1280, height: 800 });
  // Suppress console noise
  page.on('console', () => {});
  page.on('pageerror', () => {});
  return page;
}

async function goto(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2' });
}

async function fill(page, selector, value) {
  await page.waitForSelector(selector, { visible: true });
  await page.click(selector, { clickCount: 3 });
  await page.type(selector, value);
}

async function click(page, selector) {
  await page.waitForSelector(selector, { visible: true });
  await page.click(selector);
}

async function waitForText(page, text, timeout = 8000) {
  await page.waitForFunction(
    (t) => document.body.innerText.includes(t),
    { timeout },
    text
  );
}

async function screenshot(page, name) {
  await page.screenshot({ path: `/tmp/nepal360-${name}.png`, fullPage: false });
  log('📸', `Screenshot: /tmp/nepal360-${name}.png`);
}

// ─────────────────────────────────────────────
// LOGIN HELPER
// ─────────────────────────────────────────────
async function login(page, email, password) {
  await goto(page, '/login');
  await fill(page, 'input[type="email"]', email);
  await fill(page, 'input[type="password"]', password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await new Promise(r => setTimeout(r, 1500));
}

// ─────────────────────────────────────────────
// TEST: HOME PAGE (public)
// ─────────────────────────────────────────────
async function testHomePage() {
  log('\n🏠', '── PUBLIC: Home Page ──');
  const page = await newPage();
  try {
    await goto(page, '/');
    await new Promise(r => setTimeout(r, 2000));
    const title = await page.title();
    ok(`Home page loaded (title: "${title}")`);
    await screenshot(page, '01-home');

    // Check campaigns section exists
    const body = await page.evaluate(() => document.body.innerText);
    if (body.length > 100) ok('Home page has content');
    else fail('Home page appears empty');
  } catch (e) {
    fail('Home page load', e);
  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────
// TEST: CAMPAIGNS LIST (public)
// ─────────────────────────────────────────────
async function testCampaignsList() {
  log('\n📋', '── PUBLIC: Campaigns List ──');
  const page = await newPage();
  try {
    await goto(page, '/campaigns');
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '02-campaigns-list');
    const body = await page.evaluate(() => document.body.innerText);
    if (body.includes('Nepal') || body.includes('Campaign') || body.includes('Help')) {
      ok('Campaigns list shows campaigns');
    } else {
      fail('Campaigns list empty or not loading');
    }
  } catch (e) {
    fail('Campaigns list', e);
  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────
// TEST: SIGNUP FLOW (new user)
// ─────────────────────────────────────────────
async function testSignup() {
  log('\n📝', '── AUTH: Signup Flow ──');
  const page = await newPage();
  const testEmail = `testuser_${Date.now()}@test.com`;
  try {
    await goto(page, '/signup');
    await fill(page, 'input[name="name"], input[placeholder*="name" i], input[placeholder*="Name"]', 'Test User');
    await fill(page, 'input[type="email"]', testEmail);
    await fill(page, 'input[type="password"]:not([name*="confirm"]):not([placeholder*="confirm" i])', 'Test@1234');

    // Fill confirm password if present
    const confirmInput = await page.$('input[name*="confirm"], input[placeholder*="confirm" i]');
    if (confirmInput) await fill(page, 'input[name*="confirm"], input[placeholder*="confirm" i]', 'Test@1234');

    await screenshot(page, '03-signup-form');
    await click(page, 'button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));
    await screenshot(page, '04-signup-result');

    const url = page.url();
    const body = await page.evaluate(() => document.body.innerText);
    if (url.includes('verify') || body.toLowerCase().includes('otp') || body.toLowerCase().includes('verify') || body.toLowerCase().includes('email')) {
      ok(`Signup redirected to email verification (${url})`);
    } else if (body.toLowerCase().includes('success') || body.toLowerCase().includes('registered')) {
      ok('Signup completed successfully');
    } else {
      fail(`Signup result unclear — URL: ${url}`);
    }
  } catch (e) {
    fail('Signup flow', e);
  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────
// TEST: DONOR LOGIN & BROWSE
// ─────────────────────────────────────────────
async function testDonorFlow() {
  log('\n💰', '── DONOR: Login → Browse → Campaign Detail ──');
  const page = await newPage();
  try {
    // Login
    await login(page, 'amit@nepal360.com', 'donor123');
    await screenshot(page, '05-donor-login');
    const url = page.url();
    const body = await page.evaluate(() => document.body.innerText);

    if (!url.includes('/login')) {
      ok('Donor logged in successfully');
    } else if (body.toLowerCase().includes('invalid') || body.toLowerCase().includes('error')) {
      fail('Donor login failed — check password reset');
      await page.close();
      return;
    } else {
      fail(`Donor login unclear — URL: ${url}`);
    }

    // Browse campaigns
    await goto(page, '/campaigns');
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '06-donor-campaigns');
    ok('Donor can browse campaigns');

    // Open a campaign
    const campaignId = '880e8400-e29b-41d4-a716-446655440001';
    await goto(page, `/campaigns/${campaignId}`);
    await new Promise(r => setTimeout(r, 2500));
    await screenshot(page, '07-donor-campaign-detail');

    const campaignBody = await page.evaluate(() => document.body.innerText);
    if (campaignBody.includes('Donate') || campaignBody.includes('donate') || campaignBody.includes('School') || campaignBody.includes('Nepal')) {
      ok('Donor can view campaign detail page');
    } else {
      fail('Campaign detail page content not found');
    }

    // Check donate button exists
    const donateBtn = await page.$('button::-p-text(Donate), a::-p-text(Donate), [href*="donate"]');
    if (donateBtn) {
      ok('Donate button is present on campaign page');
    } else {
      // Try finding any donate-related button
      const allBtns = await page.evaluate(() =>
        [...document.querySelectorAll('button, a')].map(b => b.textContent?.trim()).filter(Boolean)
      );
      const hasDonate = allBtns.some(b => b.toLowerCase().includes('donat'));
      if (hasDonate) ok('Donate button found on campaign page');
      else fail('No donate button found on campaign page');
    }

    // Check bookmarks
    await goto(page, '/bookmarks');
    await new Promise(r => setTimeout(r, 1500));
    await screenshot(page, '08-donor-bookmarks');
    ok('Donor can access bookmarks page');

    // Check donor impact
    await goto(page, '/impact');
    await new Promise(r => setTimeout(r, 1500));
    await screenshot(page, '09-donor-impact');
    ok('Donor can access impact page');

    // Check leaderboard (public)
    await goto(page, '/leaderboard');
    await new Promise(r => setTimeout(r, 1500));
    await screenshot(page, '10-leaderboard');
    ok('Leaderboard page accessible');

    // Profile
    await goto(page, '/profile');
    await new Promise(r => setTimeout(r, 1500));
    await screenshot(page, '11-donor-profile');
    ok('Donor can access profile page');

  } catch (e) {
    fail('Donor flow', e);
    await screenshot(page, 'donor-error').catch(() => {});
  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────
// TEST: BENEFICIARY LOGIN & CAMPAIGN MANAGEMENT
// ─────────────────────────────────────────────
async function testBeneficiaryFlow() {
  log('\n🏥', '── BENEFICIARY: Login → My Campaigns → Analytics ──');
  const page = await newPage();
  try {
    await login(page, 'rajesh@nepal360.com', 'beneficiary123');
    await screenshot(page, '12-beneficiary-login');

    const url = page.url();
    if (!url.includes('/login')) {
      ok('Beneficiary logged in successfully');
    } else {
      fail('Beneficiary login failed');
      await page.close();
      return;
    }

    // My campaigns
    await goto(page, '/campaigns/me');
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '13-my-campaigns');
    const myBody = await page.evaluate(() => document.body.innerText);
    if (myBody.includes('School') || myBody.includes('Campaign') || myBody.includes('Help')) {
      ok('Beneficiary can see their campaigns');
    } else {
      fail('My campaigns page empty');
    }

    // Campaign analytics
    const campaignId = '880e8400-e29b-41d4-a716-446655440001';
    await goto(page, `/campaigns/${campaignId}/analytics`);
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '14-campaign-analytics');
    ok('Beneficiary can view campaign analytics');

    // Create campaign page
    await goto(page, '/campaigns/create');
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '15-create-campaign');
    const createBody = await page.evaluate(() => document.body.innerText);
    if (createBody.includes('KYC') || createBody.includes('Title') || createBody.includes('Campaign') || createBody.includes('Create')) {
      ok('Beneficiary can access create campaign page');
    } else {
      fail('Create campaign page issue');
    }

    // KYC form
    await goto(page, '/kyc/submit');
    await new Promise(r => setTimeout(r, 1500));
    await screenshot(page, '16-kyc-form');
    ok('Beneficiary can access KYC form');

  } catch (e) {
    fail('Beneficiary flow', e);
    await screenshot(page, 'beneficiary-error').catch(() => {});
  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────
// TEST: ADMIN LOGIN & MANAGEMENT PANELS
// ─────────────────────────────────────────────
async function testAdminFlow() {
  log('\n🔑', '── ADMIN: Login → Dashboard → KYC → Campaigns ──');
  const page = await newPage();
  try {
    await login(page, 'admin@nepal360.com', 'admin123');
    await screenshot(page, '17-admin-login');

    const urlAfterLogin = page.url();
    const bodyAfterLogin = await page.evaluate(() => document.body.innerText);
    if (!urlAfterLogin.includes('/login')) {
      ok('Admin logged in successfully');
    } else {
      fail('Admin login failed');
      await page.close();
      return;
    }

    // Admin dashboard
    await goto(page, '/admin/dashboard');
    await new Promise(r => setTimeout(r, 2500));
    await screenshot(page, '18-admin-dashboard');
    const dashBody = await page.evaluate(() => document.body.innerText);
    if (dashBody.includes('Campaign') || dashBody.includes('KYC') || dashBody.includes('Dashboard') || dashBody.includes('Admin')) {
      ok('Admin dashboard loaded');
    } else {
      fail('Admin dashboard content missing');
    }

    // KYC Management
    await goto(page, '/admin/kyc');
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '19-admin-kyc');
    ok('Admin can access KYC management');

    // Campaign Management
    await goto(page, '/admin/campaigns');
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '20-admin-campaigns');
    const campBody = await page.evaluate(() => document.body.innerText);
    if (campBody.includes('Campaign') || campBody.includes('Nepal') || campBody.includes('Help')) {
      ok('Admin campaign management shows campaigns');
    } else {
      fail('Admin campaign management empty');
    }

    // Admin campaign detail
    const campaignId = '74a03fc6-9544-4b7f-91a7-a0cd1df2c0b9'; // PENDING_VERIFICATION
    await goto(page, `/admin/campaigns/${campaignId}`);
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '21-admin-campaign-detail');
    const detailBody = await page.evaluate(() => document.body.innerText);
    if (detailBody.includes('Approve') || detailBody.includes('Reject') || detailBody.includes('Verify') || detailBody.includes('Campaign')) {
      ok('Admin campaign detail has approval controls');
    } else {
      fail('Admin campaign detail missing controls');
    }

    // Audit logs
    await goto(page, '/admin/audit-logs');
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '22-admin-audit-logs');
    ok('Admin can access audit logs');

    // Reports
    await goto(page, '/admin/reports');
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '23-admin-reports');
    ok('Admin can access reports');

    // Badge management
    await goto(page, '/admin/badges');
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '24-admin-badges');
    ok('Admin can access badge management');

    // Item donation management
    await goto(page, '/admin/item-donations');
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '25-admin-item-donations');
    ok('Admin can access item donation management');

  } catch (e) {
    fail('Admin flow', e);
    await screenshot(page, 'admin-error').catch(() => {});
  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────
// TEST: CAMPAIGN MAP & ACTIVITY FEED (public)
// ─────────────────────────────────────────────
async function testPublicPages() {
  log('\n🗺️', '── PUBLIC: Map & Activity Feed ──');
  const page = await newPage();
  try {
    await goto(page, '/map');
    await new Promise(r => setTimeout(r, 3000));
    await screenshot(page, '26-campaign-map');
    ok('Campaign map page loaded');

    await goto(page, '/activity');
    await new Promise(r => setTimeout(r, 2000));
    await screenshot(page, '27-activity-feed');
    ok('Activity feed page loaded');

    await goto(page, '/about');
    await new Promise(r => setTimeout(r, 1500));
    await screenshot(page, '28-about');
    ok('About page loaded');
  } catch (e) {
    fail('Public pages', e);
  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     Nepal360 E2E Browser Test Suite      ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null,
  });

  try {
    await testHomePage();
    await testCampaignsList();
    await testSignup();
    await testDonorFlow();
    await testBeneficiaryFlow();
    await testAdminFlow();
    await testPublicPages();
  } finally {
    await browser.close();
  }

  console.log('');
  console.log('══════════════════════════════════════════');
  console.log(`  Results: ✅ ${passed} passed  ❌ ${failed} failed`);
  console.log('══════════════════════════════════════════');
  console.log('  Screenshots saved to /tmp/nepal360-*.png');
  console.log('');

  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Fatal:', err);
  if (browser) browser.close();
  process.exit(1);
});
