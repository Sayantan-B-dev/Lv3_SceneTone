import { Button } from '@/components/ui/Button';
import { useCurrentUser, useSignOut } from '@/hooks/useAuth';
import { SignInButton } from './SignInButton';

export function AuthControl() {
  const { data: user, isPending } = useCurrentUser();
  const signOut = useSignOut();

  if (isPending) {
    return (
      <span className="app-auth__loading" role="status">
        Checking session...
      </span>
    );
  }

  if (!user) {
    return <SignInButton />;
  }

  return (
    <div className="app-auth">
      <span className="app-auth__name" title={user.email}>
        {user.name}
      </span>
      <Button
        variant="secondary"
        type="button"
        className="app-auth__signout"
        onClick={() => signOut.mutate()}
        disabled={signOut.isPending}
      >
        {signOut.isPending ? 'Signing out...' : 'Sign out'}
      </Button>
    </div>
  );
}
