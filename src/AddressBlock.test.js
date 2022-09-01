import {render, screen} from '@testing-library/react';

import AddressBlock from './AddressBlock';

test('displays an empty fragment with no address', async () => {
  render(<AddressBlock address={[]} />);
  expect(screen.queryByRole('a')).not.toBeInTheDocument();
});

test('includes a link to Google Maps', async() => {
  render(<AddressBlock address={['123 Anywhere Lane']} />);
  expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringMatching(/^https:\/\/www.google.com\/maps\//));
});
