import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/Button';
import { useGoogleSignIn } from '@/hooks/useAuth';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function SignInButton() {
  const signIn = useGoogleSignIn();
  const [error, setError] = useState<string | null>(null);

  if (!clientId) {
    return (
      <Button
        variant="secondary"
        type="button"
        disabled
        title="Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in."
      >
        Sign-in not configured
      </Button>
    );
  }

  return (
    <div className="sign-in">
      <GoogleLogin
        theme="filled_black"
        shape="rectangular"
        size="medium"
        text="signin_with"
        onSuccess={(response) => {
          if (!response.credential) {
            setError('Google did not return a credential. Try again.');
            return;
          }
          setError(null);
          signIn.mutate(response.credential);
        }}
        onError={() => setError('Google sign-in failed. Try again.')}
      />
      {signIn.isPending ? (
        <span className="sign-in__status" role="status">
          Signing in...
        </span>
      ) : null}
      {error || signIn.isError ? (
        <span className="sign-in__error" role="alert">
          {error ?? 'Sign-in failed. Try again.'}
        </span>
      ) : null}
    </div>
  );
}
