import { useGlobalStateStore } from '@GlobalState';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const AuthVerify = () => {
  const location = useLocation();
  const state = useGlobalStateStore((state) => state);

  // Removed redundant state hydration
  // User is loaded synchronously in GlobalState

  // Check token expiration
  useEffect(() => {
    if (state.user && state.user.accessToken) {
      const decodedJwt = parseJwt(state.user.accessToken);
      if (decodedJwt && decodedJwt.exp * 1000 < Date.now()) {
        toast.warning('Your token expired');
        state.signOut();
      }
    }
  }, [location, state]);

  return <span style={{ position: 'absolute' }}></span>;
};

export default AuthVerify;
