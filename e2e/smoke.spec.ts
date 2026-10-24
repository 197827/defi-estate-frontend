import { test, expect, type Page } from '@playwright/test';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

const properties = [
  {
    id: 'prop-1',
    title: 'Sunny Loft Downtown',
    description: 'A bright loft in the city center.',
    price: 1200,
    location: 'Downtown',
    bedrooms: 2,
    bathrooms: 1,
    imageUrl: 'https://example.com/prop-1.jpg',
  },
  {
    id: 'prop-2',
    title: 'Cozy Cottage',
    description: 'A quiet cottage near the park.',
    price: 900,
    location: 'Riverside',
    bedrooms: 1,
    bathrooms: 1,
    imageUrl: 'https://example.com/prop-2.jpg',
  },
];

async function mockApi(page: Page) {
  await page.route(`${API_URL}/**`, async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path === '/properties' || path === '/api/properties') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(properties),
      });
      return;
    }

    const detailMatch = path.match(/^\/(?:api\/)?properties\/([^/]+)$/);
    if (detailMatch) {
      const id = decodeURIComponent(detailMatch[1]);
      const property = properties.find((p) => p.id === id);
      if (property) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(property),
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Property not found' }),
        });
      }
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Not found' }),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await expect(page).toHaveTitle(/.+/);
});

test('property list shows cards', async ({ page }) => {
  await page.goto('/');
  for (const property of properties) {
    await expect(page.getByText(property.title)).toBeVisible();
  }
});

test('clicking a card opens the detail page', async ({ page }) => {
  await page.goto('/');
  const first = properties[0];
  await page.getByText(first.title).click();
  await expect(page).toHaveURL(new RegExp(`/properties/${first.id}`));
  await expect(page.getByText(first.title)).toBeVisible();
  await expect(page.getByText(first.description)).toBeVisible();
});

test('unknown property shows not-found', async ({ page }) => {
  await page.goto('/properties/does-not-exist');
  await expect(page.getByText(/not found/i)).toBeVisible();
});