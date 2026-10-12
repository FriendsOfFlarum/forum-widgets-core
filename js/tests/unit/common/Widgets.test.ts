import { jest } from '@jest/globals';
import Widgets from '../../../src/common/extend/Widgets';
import type { Widget } from '../../../src/common/extend/Widgets';

const widget = (key: string): Widget => ({ key, component: null, placement: 'end', isDisabled: false, isUnique: true });

describe('Widgets', () => {
  it('registers every added widget with app.widgets under the given extension', () => {
    const add = jest.fn();
    const first = widget('first');
    const second = widget('second');

    new Widgets().add(first).add(second).extend({ widgets: { add } }, 'acme-widget');

    expect(add.mock.calls).toEqual([
      [first, 'acme-widget'],
      [second, 'acme-widget'],
    ]);
  });

  it('registers nothing when no widget was added', () => {
    const add = jest.fn();

    new Widgets().extend({ widgets: { add } }, 'acme-widget');

    expect(add).not.toHaveBeenCalled();
  });
});
