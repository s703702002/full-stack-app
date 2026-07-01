import { LoginPage, initApi } from '@full-stack-app/features';
import { privateApi } from '../api';
import { useToast } from '../hooks/useToast';

initApi(privateApi);

export default function Login() {
  const { error } = useToast();

  return <LoginPage onErrorToast={(msg) => error(msg)} />;
}
