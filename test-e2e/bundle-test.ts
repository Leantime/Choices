import { test as base } from '@playwright/test';

export type BundleTest = {
  bundle: string | undefined;
};

export const test = base.extend<BundleTest>({
  // Define an option and provide a default value.
  // We can later override it in the config.
  bundle: [undefined, { option: true }],
});
