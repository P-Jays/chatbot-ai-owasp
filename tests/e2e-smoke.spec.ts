import { test, expect } from '@playwright/test';

test('Chatbot E2E Smoke Test', async ({ page }) => {
  await page.goto('https://chatbot-ai-owasp.vercel.app');

  // Open widget
  await page.click('#chat-trigger');

  // Wait for input to appear
  await page.waitForSelector('input[aria-label="Message input"]');

  // Type message
  await page.fill('input[aria-label="Message input"]', 'hi');

  // Send
  await page.click('button[aria-label="Send message"]');

  // Wait for assistant reply
  const reply = page.locator('[aria-label="assistant message"]').first();
  await reply.waitFor({ timeout: 30000 });

  const text = await reply.textContent();
  expect(text && text.length).toBeGreaterThan(0);
});
