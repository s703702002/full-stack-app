import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, expect, test, describe } from 'vitest';
import { axe } from 'vitest-axe';
import * as axeMatchers from 'vitest-axe/matchers.js';
import 'vitest-axe/extend-expect';
import BanModal from './BanModal';
import { UserDTO } from '@full-stack-app/shared';

expect.extend(axeMatchers);

const mockUser: UserDTO = {
  id: 'user-1',
  username: 'testuser',
  name: 'Test User',
  avatarUrl: null,
  roleId: 1,
  bio: 'hello',
};

describe('BanModal', () => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();

  test('renders correctly with target user info', () => {
    render(
      <BanModal target={mockUser} onConfirm={onConfirm} onClose={onClose} />,
    );

    expect(screen.getByText('停用帳號')).toBeInTheDocument();
    expect(screen.getByText(/@testuser/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '確認停用' })).toBeDisabled();
  });

  test('calls onConfirm with reason and duration', async () => {
    const user = userEvent.setup();
    render(
      <BanModal target={mockUser} onConfirm={onConfirm} onClose={onClose} />,
    );

    // Change duration
    const select = screen.getByLabelText('停用時長');
    await user.selectOptions(select, '1440'); // 24 小時

    // Fill reason
    const textarea = screen.getByPlaceholderText('請填寫停用原因...');
    await user.type(textarea, 'Violation of rules');

    // Confirm button should be enabled now
    const confirmButton = screen.getByRole('button', { name: '確認停用' });
    expect(confirmButton).toBeEnabled();

    // Click confirm
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith({
      reason: 'Violation of rules',
      durationMinutes: 1440,
    });
  });

  test('calls onClose when clicking cancel', async () => {
    const user = userEvent.setup();
    render(
      <BanModal target={mockUser} onConfirm={onConfirm} onClose={onClose} />,
    );

    const cancelButton = screen.getByRole('button', { name: '取消' });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  test('has no accessibility violations', async () => {
    const { container } = render(
      <BanModal target={mockUser} onConfirm={onConfirm} onClose={onClose} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
