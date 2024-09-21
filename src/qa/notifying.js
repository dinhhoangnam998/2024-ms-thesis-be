import { getNotifier } from '@hoangnam.io/qa-tools';

const notifyingConfig = {
  discord: { url: '', enable: false },
  telegram: { url: '', chatId: '', enable: false },
};
export const notifier = getNotifier(notifyingConfig);
