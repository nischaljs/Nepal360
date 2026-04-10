/**
 * Verify payment is reflected — donor impact, campaign page, beneficiary analytics, admin view
 */
const puppeteer = require('/home/nischal/.local/share/mise/installs/node/25.5.0/lib/node_modules/puppeteer');

const BASE = 'http://localhost:5173';
const API  = 'http://localhost:3000/api';

// The donor who just completed payment
const DONOR_EMAIL    = 'donor_1775821427552@test.com';
const DONOR_PASSWORD = 'Test@12345';
const CAMPAIGN_ID    = '880e8400-e29b-41d4-a716-446655440001';

let browser;

async function newPage() {
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  await page.setViewport({ width: 1280, height: 900 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  return page;
}

const goto  = (p, path) => p.goto(`${BASE}${path}`, { waitUntil: 'networkidle2' });
const pause = (ms = 1500) => new Promise(r => setTimeout(r, ms));
const ss    = async (p, n) => { await p.screenshot({ path: `/tmp/verify-${n}.png`, fullPage: false }); console.log(`📸 /tmp/verify-${n}.png`); };

async function login(page, email, password) {
  await goto(page, '/login');
  const emailIn = await page.$('input[type="email"]');
  await emailIn.click({ clickCount: 3 }); await emailIn.type(email);
  const passIn  = await page.$('input[type="password"]');
  await passIn.click({ clickCount: 3 }); await passIn.type(password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await pause();
}

async function main() {
  browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'], defaultViewport: null });

  console.log('\n══ 1. CAMPAIGN PAGE — does it show the donation? ══');
  {
    const page = await newPage();
    await goto(page, `/campaigns/${CAMPAIGN_ID}`);
    await pause(2500);
    await ss(page, '1-campaign-page');
    const body = await page.evaluate(() => document.body.innerText);
    const raised = body.match(/[\d,]+(?:\.\d+)?\s*(?:raised|NPR|रू)/i)?.[0] || 'not found';
    const donors = body.match(/\d+\s*(?:Donation|donor)/i)?.[0] || 'not found';
    console.log(`   Raised: ${raised} | Donors: ${donors}`);
    await page.close();
  }

  console.log('\n══ 2. DONOR IMPACT PAGE — Rs. 500 reflected? ══');
  {
    const page = await newPage();
    await login(page, DONOR_EMAIL, DONOR_PASSWORD);
    await goto(page, '/impact');
    await pause(2000);
    await ss(page, '2-donor-impact');
    const body = await page.evaluate(() => document.body.innerText);
    console.log(`   Total donated: ${body.match(/Rs\.\s*[\d,]+|NPR\s*[\d,]+|रू\s*[\d,]+/i)?.[0] || 'check screenshot'}`);
    console.log(`   Campaigns supported: ${body.match(/\d+\s*(?:campaign|supported)/i)?.[0] || 'check screenshot'}`);

    // Also check profile
    await goto(page, '/profile');
    await pause(2000);
    await ss(page, '3-donor-profile');
    await page.close();
  }

  console.log('\n══ 3. BENEFICIARY ANALYTICS — sees the donation on their campaign? ══');
  {
    const page = await newPage();
    await login(page, 'rajesh@nepal360.com', 'beneficiary123');
    await goto(page, `/campaigns/${CAMPAIGN_ID}/analytics`);
    await pause(2500);
    await ss(page, '4-beneficiary-analytics');
    const body = await page.evaluate(() => document.body.innerText);
    console.log(`   Analytics shows: ${body.substring(0, 200).replace(/\n/g,' ')}`);

    // Also check my campaigns list
    await goto(page, '/campaigns/me');
    await pause(2000);
    await ss(page, '5-beneficiary-my-campaigns');
    await page.close();
  }

  console.log('\n══ 4. ADMIN — sees donation in campaign detail + item donations ══');
  {
    const page = await newPage();
    await login(page, 'admin@nepal360.com', 'admin123');
    await goto(page, `/admin/campaigns/${CAMPAIGN_ID}`);
    await pause(2500);
    await ss(page, '6-admin-campaign-detail');
    const body = await page.evaluate(() => document.body.innerText);
    console.log(`   Admin campaign detail: ${body.substring(0, 300).replace(/\n/g,' ')}`);

    // Item donations management
    await goto(page, '/admin/item-donations');
    await pause(2000);
    await ss(page, '7-admin-item-donations');
    console.log('   Admin item donations list captured');

    // Dashboard
    await goto(page, '/admin/dashboard');
    await pause(2500);
    await ss(page, '8-admin-dashboard-updated');
    await page.close();
  }

  await browser.close();
  console.log('\n✅ All verification screenshots saved to /tmp/verify-*.png');
}

main().catch(e => { console.error(e); browser?.close(); });
