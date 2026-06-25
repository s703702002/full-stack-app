import { LoginPage } from '@full-stack-app/features';
import { useToast } from '../hooks/useToast';

export default function Login() {
  const { error } = useToast();

  return <LoginPage onErrorToast={(msg) => error(msg)} />;
}
