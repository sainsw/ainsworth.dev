import { render } from '@testing-library/react';
import { createRef } from 'react';
import { Turnstile, type TurnstileRef } from '../components/turnstile';

describe('Turnstile', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.turnstile;
  });

  it('rejects a pending execution when verification fails', async () => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'test-site-key');
    let errorCallback: ((errorCode: string) => boolean | undefined) | undefined;
    const execute = vi.fn();

    window.turnstile = {
      render: vi.fn((_container, options) => {
        errorCallback = options['error-callback'];
        return 'widget-id';
      }),
      execute,
      remove: vi.fn(),
      reset: vi.fn(),
    };

    const ref = createRef<TurnstileRef>();
    render(<Turnstile ref={ref} invisible />);

    const token = ref.current!.execute();

    expect(execute).toHaveBeenCalledWith('widget-id');
    expect(errorCallback?.('300030')).toBe(true);
    await expect(token).rejects.toThrow('Turnstile verification failed: 300030');
  });
});
