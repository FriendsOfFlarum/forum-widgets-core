import sortWidgets from '../../../src/common/utils/sortWidgets';
import type { Widget } from '../../../src/common/extend/Widgets';

const widget = (key: string, position?: number): Widget => ({ key, position, component: null, placement: 'end', isDisabled: false, isUnique: true });

describe('sortWidgets', () => {
  it('orders widgets by ascending position', () => {
    const sorted = sortWidgets([widget('c', 2), widget('a', 0), widget('b', 1)]);

    expect(sorted.map((w) => w.key)).toEqual(['a', 'b', 'c']);
  });

  it('does not reorder the array it is given', () => {
    const widgets = [widget('b', 1), widget('a', 0)];

    sortWidgets(widgets);

    expect(widgets.map((w) => w.key)).toEqual(['b', 'a']);
  });

  it('keeps widgets with an equal position in their original order', () => {
    const sorted = sortWidgets([widget('first', 1), widget('second', 1)]);

    expect(sorted.map((w) => w.key)).toEqual(['first', 'second']);
  });
});
