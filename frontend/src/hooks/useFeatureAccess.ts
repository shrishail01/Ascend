import { useState, useCallback } from 'react';
import { checkFeatureAccess } from '@/api/settings';

export function useFeatureAccess(featureName: string) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [limit, setLimit] = useState(2);
  const [isPremium, setIsPremium] = useState(false);

  const checkAccess = useCallback(async (increment = false): Promise<boolean> => {
    try {
      const result = await checkFeatureAccess({ feature: featureName, increment });
      setUsageCount(result.usageCount);
      setLimit(result.limit);
      setIsPremium(result.isPremium);

      if (!result.allowed && !result.isPremium) {
        setShowUpgrade(true);
        return false;
      }
      return true;
    } catch {
      // On error, allow usage (don't block user due to check failure)
      return true;
    }
  }, [featureName]);

  const closeUpgrade = useCallback(() => setShowUpgrade(false), []);
  const onUpgraded = useCallback(() => {
    setIsPremium(true);
    setShowUpgrade(false);
  }, []);

  return { checkAccess, showUpgrade, closeUpgrade, onUpgraded, usageCount, limit, isPremium };
}
