import { useGlobalStateStore } from '@GlobalState';
import { trpc } from '@utils/trpc';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SignInCardUI, { SignInFormValues } from './SignInCardUI';

const SignInCard = () => {
  const state = useGlobalStateStore((state) => state);
  const navigate = useNavigate();

  const [rememberMe, setRememberMe] = useState(false);
  const handleRememberMe = (value: boolean) => {
    setRememberMe(value);
  };

  const signInMutation = trpc.auth.signIn.useMutation({
    onSuccess(data) {
      const user = {
        id: data.id,
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        role: data.role,
        accessToken: data.accessToken,
      };
      state.signIn(user);
      toast.info('Signed in');
      navigate('/');
    },
    onError(error) {
      toast.error(error.message);
    },
  });
  const onSubmit = (values: SignInFormValues) => {
    signInMutation.mutate(values);
  };

  return (
    <SignInCardUI
      onSubmit={onSubmit}
      rememberMe={rememberMe}
      handleRememberMe={handleRememberMe}
    />
  );
};

export default SignInCard;
