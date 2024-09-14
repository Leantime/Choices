import { expect, type Locator, type Page } from '@playwright/test';
import { TestSuit } from './test-suit';

export class SelectTestSuit extends TestSuit {
  readonly wrappedSelect: Locator;

  readonly choices: Locator;

  readonly selectableChoices: Locator;

  readonly itemsWithPlaceholder: Locator;

  constructor(page: Page, choicesBundle: string | undefined, url: string, testId: string) {
    super(page, choicesBundle, url, testId);

    this.wrappedSelect = this.group.locator('select');
    this.choices = this.dropdown.locator('.choices__item');
    this.selectableChoices = this.dropdown.locator('.choices__item:not(.choices__placeholder):not(.choices__notice)');
    this.itemsWithPlaceholder = this.itemList.locator('.choices__item');
  }

  async startWithClick(): Promise<void> {
    await this.start();
    await this.selectByClick();
    await this.expectVisibleDropdown();
  }

  async delayData(): Promise<() => void> {
    let stopJsonWaiting = (): void => {};
    const jsonWaiting = new Promise<void>((f) => {
      stopJsonWaiting = f;
    });

    await this.page.route('**/data.json', async (route) => {
      await jsonWaiting;

      const fakeData = [...new Array(10)].map((_, index) => ({
        label: `Label ${index + 1}`,
        value: `Value ${index + 1}`,
      }));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeData),
      });
    });

    return stopJsonWaiting;
  }

  getWrappedElement(): Locator {
    return this.wrappedSelect;
  }

  async expectChoiceCount(count: number): Promise<void> {
    await expect(this.selectableChoices).toHaveCount(count);
  }

  getChoiceWithText(text: string): Locator {
    return this.selectableChoices.filter({ hasText: text });
  }
}
