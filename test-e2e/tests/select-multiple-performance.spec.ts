import { expect } from '@playwright/test';
import { test } from '../bundle-test';
import { SelectTestSuit } from '../select-test-suit';

const { describe } = test;

const testUrl = '/test/select-multiple/index-performance.html';

describe(`Choices - select multiple (performance tests)`, () => {
  // test.setTimeout(30000);

  describe('scenarios', () => {
    describe('basic', () => {
      const testId = 'basic';
      const inputValue = 'test';

      describe('focusing on container', () => {
        describe('pressing enter key', () => {
          test('toggles the dropdown', async ({ page, bundle }) => {
            const suite = new SelectTestSuit(page, bundle, testUrl, testId);
            await suite.start();
            await suite.wrapper.focus();
            await suite.enterKey();
            await suite.expectVisibleDropdown();
            await suite.escapeKey();
            await suite.expectHiddenDropdown();
          });
        });

        describe('pressing an alpha-numeric key', () => {
          test('opens the dropdown and the input value', async ({ page, bundle }) => {
            const suite = new SelectTestSuit(page, bundle, testUrl, testId);
            await suite.start();
            await suite.selectByKeyPress(inputValue);
            await expect(suite.input).toHaveValue(inputValue);
          });
        });
      });

      describe('selecting choices', () => {
        const selectedChoiceText = 'Choice 1$';

        test('allows selecting choices from dropdown', async ({ page, bundle }) => {
          const suite = new SelectTestSuit(page, bundle, testUrl, testId);
          await suite.startWithClick();

          await suite.choices.first().click();
          await expect(suite.items.last()).toHaveText(selectedChoiceText);
        });

        test('remove selected choice from dropdown list', async ({ page, bundle }) => {
          const suite = new SelectTestSuit(page, bundle, testUrl, testId);
          await suite.startWithClick();

          await suite.choices.first().click();
          await expect(suite.choices.first()).not.toHaveText(selectedChoiceText);
          await expect(suite.items.last()).toHaveText(selectedChoiceText);
        });

        test('multiple choices', async ({ page, bundle }) => {
          const suite = new SelectTestSuit(page, bundle, testUrl, testId);
          await suite.startWithClick();

          await suite.expectedItemCount(1000);
          await suite.expectChoiceCount(1000);
          await suite.expectVisibleDropdown();

          await suite.getChoiceWithText('Choice 1$').click();
          await suite.expectedItemCount(1001);
          await suite.expectChoiceCount(999);
          await suite.expectVisibleDropdown();

          await suite.getChoiceWithText('Choice 3$').click();
          await suite.expectedItemCount(1002);
          await suite.expectChoiceCount(998);
          await suite.expectVisibleDropdown();
        });

        /* This test is unreasonably slow due to selecting over a thousand items...
        describe('slowly', () => {
          test.setTimeout(60000);
          test('all available choices', async ({ page, bundle }) => {
            const suite = new SelectTestSuit(page, bundle, testUrl, testId);
            await suite.startWithClick();

            const itemCount = await suite.items.count();
            const count = await suite.choices.count();

            for (let i = 1; i < count + 1; i++) {
              await suite.expectVisibleDropdown();
              await suite.getChoiceWithText(`Choice ${i * 2 - 1}$`).click();
              await suite.advanceClock();
              await suite.expectedItemCount(itemCount + i);
              await expect(suite.selectableChoices).toHaveCount(count - i);
            }

            await suite.expectVisibleNoticeHtml('No choices to choose from', true)
          });
        });
        */
      });

      describe('keys for choice', () => {
        test('up/down arrows for selection', async ({ page, bundle }) => {
          const suite = new SelectTestSuit(page, bundle, testUrl, testId);
          await suite.startWithClick();

          await suite.input.press('ArrowDown');
          await expect(suite.choices.first()).not.toHaveClass(/is-highlighted/);
          await expect(suite.choices.nth(1)).toHaveClass(/is-highlighted/);

          await suite.input.press('ArrowUp');
          await expect(suite.choices.first()).toHaveClass(/is-highlighted/);
          await expect(suite.choices.nth(1)).not.toHaveClass(/is-highlighted/);
        });

        test('page-up/page-down arrows for selection', async ({ page, bundle }) => {
          const suite = new SelectTestSuit(page, bundle, testUrl, testId);
          await suite.startWithClick();

          await suite.input.press('PageDown');
          await expect(suite.choices.first()).not.toHaveClass(/is-highlighted/);
          await expect(suite.choices.last()).toHaveClass(/is-highlighted/);

          await suite.input.press('PageUp');
          await expect(suite.choices.first()).toHaveClass(/is-highlighted/);
          await expect(suite.choices.last()).not.toHaveClass(/is-highlighted/);
        });
      });

      describe('searching choices', () => {
        describe('on input', () => {
          describe('searching by label', () => {
            test('displays choices filtered by inputted value', async ({ page, bundle }) => {
              const suite = new SelectTestSuit(page, bundle, testUrl, testId);
              await suite.startWithClick();
              await suite.typeText('item2');

              await suite.expectVisibleDropdownWithItem('Choice 2');
            });
          });

          describe('searching by value', () => {
            test('displays choices filtered by inputted value - by character', async ({ page, bundle }) => {
              const suite = new SelectTestSuit(page, bundle, testUrl, testId);
              const searchTerm = 'Choice 3';
              await suite.startWithClick();
              for (const t of [...searchTerm]) {
                await suite.typeText(t);
              }
              // await suite.typeText(searchTerm);

              await suite.expectVisibleDropdownWithItem(searchTerm);
            });

            test('displays choices filtered by inputted value - by phrase', async ({ page, bundle }) => {
              const suite = new SelectTestSuit(page, bundle, testUrl, testId);
              const searchTerm = 'Choice 3';
              await suite.startWithClick();
              await suite.typeText(searchTerm);

              await suite.expectVisibleDropdownWithItem(searchTerm);
            });
          });

          describe('no results found', () => {
            test('displays "no results found" prompt', async ({ page, bundle }) => {
              const suite = new SelectTestSuit(page, bundle, testUrl, testId);
              await suite.startWithClick();
              await suite.typeText('faergge');

              await suite.expectVisibleNoticeHtml('No results found', true);
            });
          });
        });
      });

      describe('disabling', () => {
        describe('on disable', () => {
          test('disables the search input', async ({ page, bundle }) => {
            const suite = new SelectTestSuit(page, bundle, testUrl, testId);
            await suite.startWithClick();
            await suite.group.locator('button.disable').click();
            await expect(suite.wrapper).toBeDisabled();
            await expect(suite.input).toBeDisabled();
          });
        });
      });

      describe('enabling', () => {
        describe('on enable', () => {
          test('enables the search input', async ({ page, bundle }) => {
            const suite = new SelectTestSuit(page, bundle, testUrl, testId);
            await suite.startWithClick();
            await suite.group.locator('button.disable').click();
            await suite.group.locator('button.enable').click();
            await expect(suite.wrapper).toBeEnabled();
            await expect(suite.input).toBeEnabled();
          });
        });
      });
    });
  });
});
