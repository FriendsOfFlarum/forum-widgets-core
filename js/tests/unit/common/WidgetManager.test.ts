import WidgetManager from '../../../src/common/WidgetManager';
import enableExtensions from '../../enableExtensions';
import type { Widget } from '../../../src/common/extend/Widgets';

const Component = {};

const widget = (key: string, overrides: Partial<Widget> = {}): Widget => ({
  key,
  component: Component,
  placement: 'end',
  position: 0,
  isDisabled: false,
  isUnique: true,
  ...overrides,
});

describe('WidgetManager', () => {
  let manager: WidgetManager;

  beforeEach(() => {
    manager = new WidgetManager();
    manager.setConfig({});
    enableExtensions('acme-one', 'acme-two');
  });

  describe('add', () => {
    it('identifies a widget by its extension and key', () => {
      manager.add(widget('stats'), 'acme-one');

      expect(manager.widgets[0]).toMatchObject({ id: 'acme-one:stats', extension: 'acme-one' });
    });

    it('gives each widget its own state object', () => {
      manager.add(widget('stats'), 'acme-one');
      manager.add(widget('news'), 'acme-two');

      expect(manager.states['acme-one:stats']).toEqual({});
      expect(manager.states['acme-one:stats']).not.toBe(manager.states['acme-two:news']);
    });
  });

  describe('get', () => {
    it('returns the widgets registered for a placement when nothing is configured', () => {
      manager.add(widget('stats', { placement: 'end' }), 'acme-one');
      manager.add(widget('news', { placement: 'top' }), 'acme-two');

      expect(manager.get('end').map((w) => w.id)).toEqual(['acme-one:stats']);
      expect(manager.get('top').map((w) => w.id)).toEqual(['acme-two:news']);
    });

    it('passes the same state object to the widget on every call', () => {
      manager.add(widget('stats'), 'acme-one');

      const [first] = manager.get('end');
      const [second] = manager.get('end');

      expect(first.state).toBe(manager.states['acme-one:stats']);
      expect(second.state).toBe(first.state);
    });

    it('places a widget where the admin saved it, keeping its registered component', () => {
      manager.add(widget('stats', { placement: 'end', position: 0 }), 'acme-one');
      manager.setConfig({ instances: [{ id: 'acme-one:stats', extension: 'acme-one', key: 'stats', placement: 'top', position: 3 }] });

      expect(manager.get('end')).toEqual([]);
      expect(manager.get('top')).toEqual([expect.objectContaining({ id: 'acme-one:stats', position: 3, component: Component })]);
    });

    it('leaves out widgets the admin removed from the layout', () => {
      manager.add(widget('stats'), 'acme-one');
      manager.add(widget('news'), 'acme-two');
      manager.setConfig({ disabled: ['acme-one:stats'] });

      expect(manager.get('end').map((w) => w.id)).toEqual(['acme-two:news']);
    });

    it('leaves out widgets whose extension is not enabled', () => {
      manager.add(widget('stats'), 'acme-one');
      manager.add(widget('news'), 'acme-two');
      enableExtensions('acme-two');

      expect(manager.get('end').map((w) => w.id)).toEqual(['acme-two:news']);
    });

    it('finds the extension of a saved widget from its id when the saved entry lacks one', () => {
      manager.add(widget('stats'), 'acme-one');
      manager.setConfig({ instances: [{ id: 'acme-one:stats', placement: 'end', position: 0 }] });

      expect(manager.get('end')).toEqual([expect.objectContaining({ id: 'acme-one:stats', extension: 'acme-one' })]);
    });

    it.each([
      ['a boolean', true],
      ['a callback', () => true],
    ])('hides a widget whose isDisabled is %s returning true, unless hidden widgets are asked for', (_, isDisabled) => {
      manager.add(widget('stats', { isDisabled }), 'acme-one');

      expect(manager.get('end')).toEqual([]);
      expect(manager.get('end', true).map((w) => w.id)).toEqual(['acme-one:stats']);
    });

    it('shows a widget whose isDisabled callback returns false', () => {
      manager.add(widget('stats', { isDisabled: () => false }), 'acme-one');

      expect(manager.get('end').map((w) => w.id)).toEqual(['acme-one:stats']);
    });
  });

  describe('getbyId', () => {
    it('returns the widget with that id, or null', () => {
      manager.add(widget('stats'), 'acme-one');

      expect(manager.getbyId('acme-one:stats')).toMatchObject({ key: 'stats' });
      expect(manager.getbyId('acme-one:missing')).toBeNull();
    });

    it('does not return a widget the admin removed from the layout', () => {
      manager.add(widget('stats'), 'acme-one');
      manager.setConfig({ disabled: ['acme-one:stats'] });

      expect(manager.getbyId('acme-one:stats')).toBeNull();
    });
  });
});
