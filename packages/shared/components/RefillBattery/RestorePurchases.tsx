import React, { memo, useCallback } from 'react';
import { Steezy, Text, Toast } from '@tonkeeper/uikit';
import { t } from '../../i18n';
import { getPendingPurchasesIOS, finishTransaction } from 'react-native-iap';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { Platform } from 'react-native';

export const RestorePurchases = memo(() => {
  const handleRestorePurchases = useCallback(async () => {
    try {
      const purchases = await getPendingPurchasesIOS();

      if (!purchases.length) {
        return Toast.fail('Nothing to restore');
      }

      const processedTransactions = await tk.wallet.battery.makeIosPurchase(
        purchases.map((purchase) => ({ id: purchase.transactionId })),
      );

      for (let purchase of purchases) {
        if (
          !processedTransactions ||
          !processedTransactions.find(
            (processedTransaction) =>
              purchase.transactionId === processedTransaction.transaction_id,
          )
        ) {
          continue;
        }
        await finishTransaction({ purchase, isConsumable: true });
      }

      Toast.success(t('battery.refilled'));
    } catch (e) {
      Toast.fail(e.message);
    }
  }, []);

  return (
    <Text style={styles.text.static} type="body2" textAlign="center" color="textTertiary">
      {t('battery.packages.disclaimer')}
      {Platform.OS === 'ios' && (
        <>
          {' '}
          <Text
            onPress={handleRestorePurchases}
            type="body2"
            textAlign="center"
            color="textSecondary"
          >
            {t('battery.packages.restore')}
          </Text>
        </>
      )}
      .
    </Text>
  );
});

const styles = Steezy.create({
  text: {
    paddingHorizontal: 16,
  },
});
