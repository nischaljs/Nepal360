import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import type { CurrentUser } from '../types/auth.types';

interface KycCheckResult {
  isLoading: boolean;
  hasApprovedKyc: boolean;
  kycStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED' | null;
  user: CurrentUser | null;
}

export const useKycCheck = (): KycCheckResult => {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const [kycStatus, setKycStatus] = useState<'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkKycStatus = () => {
      if (isAuthLoading) {
        setIsLoading(true);
        return;
      }

      if (!user) {
        setKycStatus(null);
        setIsLoading(false);
        return;
      }

      // Check if user has kycProfile and its status
      if (user.kycProfile) {
        setKycStatus(user.kycProfile.status);
      } else {
        setKycStatus('NOT_SUBMITTED');
      }
      setIsLoading(false);
    };

    checkKycStatus();
  }, [user, isAuthLoading]);

  const hasApprovedKyc = kycStatus === 'APPROVED';

  return {
    isLoading,
    hasApprovedKyc,
    kycStatus,
    user,
  };
};

// HOC type for protected routes that need KYC verification
export function withKycCheck<P extends Record<string, unknown>>(
  WrappedComponent: (props: P) => ReactNode,
  redirectPath: string = '/kyc/submit'
) {
  return function WithKycCheckComponent(props: P): ReactNode {
    const navigate = useNavigate();
    const { isLoading, hasApprovedKyc, user } = useKycCheck();

    useEffect(() => {
      if (!isLoading && user && !hasApprovedKyc) {
        navigate(redirectPath);
      }
    }, [isLoading, hasApprovedKyc, user, navigate, redirectPath]);

    if (isLoading) {
      return null;
    }

    if (!user || !hasApprovedKyc) {
      return null;
    }

    return WrappedComponent(props);
  };
}

export default useKycCheck;
