import { describe, expect, it } from 'vitest';
import { compile } from './utils';

describe('styleMap transformation', () => {
  it('should transform classMap to class attribute with classMap function wrapped', async () => {
    const input = `
function ClassMap() {
  return <div classMap={{ active: true, disabled: false }}>Hello</div>;
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });
});
