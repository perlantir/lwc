import { test, expect } from '@playwright/test';

test('home page renders header + hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
});

test('schedule page lists events and shows subscribe button', async ({ page }) => {
  await page.goto('/schedule');
  await expect(page.getByText('Upcoming events')).toBeVisible();
  await expect(page.getByRole('button', { name: /subscribe to calendar/i })).toBeVisible();
});

test('events.ics returns valid VCALENDAR', async ({ request }) => {
  const res = await request.get('/events.ics');
  expect(res.ok()).toBe(true);
  expect(res.headers()['content-type']).toContain('text/calendar');
  const text = await res.text();
  expect(text).toContain('BEGIN:VCALENDAR');
  expect(text).toContain('END:VCALENDAR');
});

test('contact form rejects honeypot spam silently', async ({ request }) => {
  const res = await request.post('/api/contact', {
    data: {
      firstName: 'Bot',
      lastName: 'Bot',
      email: 'bot@example.com',
      message: 'spam spam spam',
      website: 'http://spam.example',
      startedAt: Date.now() - 5000,
    },
  });
  // We accept silently to avoid leaking honeypot to spammers
  expect(res.status()).toBe(200);
});

test('admin redirects unauthenticated user to login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/(login|create-first-user)/i);
});
