import { jest } from '@jest/globals';
import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import m from 'mithril';
import mq from 'mithril-query';
import app from 'flarum/forum/app';
import PageState from 'flarum/common/states/PageState';
import IndexPage from 'flarum/forum/components/IndexPage';
import Page from 'flarum/common/components/Page';
import Component from 'flarum/common/Component';
import WidgetManager from '../../../src/common/WidgetManager';
import type { Placement } from '../../../src/common/extend/Widgets';
import enableExtensions from '../../enableExtensions';
import FloatingWidgetSection from '../../../src/forum/components/FloatingWidgetSection';

beforeAll(() => bootstrapForum());

/** Renders its key, and the state object it was handed, so tests can see both. */
class KeyWidget extends Component<{ state: any }> {
  static key = '';

  view() {
    this.attrs.state.rendered = true;

    return m('.KeyWidget', (this.constructor as typeof KeyWidget).key);
  }
}

const widgetComponent = (key: string) =>
  class extends KeyWidget {
    static key = key;
  };

const register = (placement: Placement, key: string, position: number) =>
  app.widgets.add({ key, placement, position, component: widgetComponent(key), isDisabled: false, isUnique: true }, 'acme-widgets');

/** A page that is not a discussion list, such as a discussion. */
class OtherPage extends Page {
  view() {
    return null;
  }
}

const LOCK_CLASS = 'FofWidgets-floatingLock';
const toggle = '.FofWidgets-floatingWidgetSection-toggle';
const panel = '.FofWidgets-floatingWidgetSection-panel';
const openPanel = '.FofWidgets-floatingWidgetSection-panel:not([hidden])';

const pressEscape = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

describe('the floating section', () => {
  beforeEach(() => {
    app.widgets = new WidgetManager();
    app.widgets.addPage(IndexPage);
    app.widgets.setConfig({});
    enableExtensions('acme-widgets');
    app.current = new PageState(IndexPage, { routeName: 'index' });
    document.documentElement.classList.remove(LOCK_CLASS);
  });

  it('renders nothing when it has no widgets', () => {
    register('end', 'elsewhere', 1);

    expect(mq(FloatingWidgetSection)).not.toHaveElement('.FofWidgets-floatingWidgetSection');
  });

  it('starts closed, as a launcher button only', () => {
    register('floating', 'first', 1);

    const dock = mq(FloatingWidgetSection);

    expect(dock).toHaveElement(toggle);
    expect(dock).not.toHaveElement(panel);
    expect(dock.first(toggle).getAttribute('aria-expanded')).toBe('false');
  });

  it('opens to show its widgets in position order, and closes again', () => {
    register('floating', 'second', 2);
    register('floating', 'first', 1);
    register('end', 'elsewhere', 1);

    const dock = mq(FloatingWidgetSection);

    dock.click(toggle);

    expect(dock).toHaveElement(`${openPanel}[role="dialog"]`);
    expect(dock.first(toggle).getAttribute('aria-expanded')).toBe('true');
    expect(dock.find('.KeyWidget').map((node: any) => node.textContent)).toEqual(['first', 'second']);

    dock.click(toggle);

    expect(dock).toHaveElement(`${panel}[hidden]`);
    expect(dock.first(toggle).getAttribute('aria-expanded')).toBe('false');
  });

  it('renders no widgets until it is first opened', () => {
    register('floating', 'first', 1);

    const dock = mq(FloatingWidgetSection);

    expect(dock).not.toHaveElement('.KeyWidget');
    expect(app.widgets.states['acme-widgets:first']).toEqual({});
  });

  it('keeps its widgets mounted, hidden, after closing, so reopening does not mount them again', () => {
    let mounts = 0;
    class CountingWidget extends Component<{ state: any }> {
      oninit(vnode: any) {
        super.oninit(vnode);
        mounts++;
      }

      view() {
        return m('.CountingWidget');
      }
    }
    app.widgets.add(
      { key: 'counting', placement: 'floating', position: 0, component: CountingWidget, isDisabled: false, isUnique: true },
      'acme-widgets'
    );

    const dock = mq(FloatingWidgetSection);

    dock.click(toggle);
    dock.click(toggle);

    expect(dock).toHaveElement(`${panel}[hidden] .CountingWidget`);

    dock.click(toggle);

    expect(dock).toHaveElement(`${openPanel} .CountingWidget`);
    expect(mounts).toBe(1);
  });

  it('hands each widget its persistent state', () => {
    register('floating', 'first', 1);

    mq(FloatingWidgetSection).click(toggle);

    expect(app.widgets.states['acme-widgets:first']).toEqual({ rendered: true });
  });

  it('shows on pages that are not discussion lists', () => {
    register('floating', 'first', 1);
    app.current = new PageState(OtherPage, { routeName: 'discussion' });

    expect(mq(FloatingWidgetSection)).toHaveElement(toggle);
  });

  it.each([
    ['phone', 'true'],
    ['desktop', 'false'],
  ])('marks the open panel as modal only where it covers the page (%s)', (screen, modal) => {
    register('floating', 'first', 1);
    jest.spyOn(app, 'screen').mockReturnValue(screen as any);

    const dock = mq(FloatingWidgetSection);
    dock.click(toggle);

    expect(dock.first(panel).getAttribute('aria-modal')).toBe(modal);

    jest.restoreAllMocks();
  });

  it('locks the page scroll while open, and unlocks it on close', () => {
    register('floating', 'first', 1);

    const dock = mq(FloatingWidgetSection);

    dock.click(toggle);
    expect(document.documentElement.classList.contains(LOCK_CLASS)).toBe(true);

    dock.click(toggle);
    expect(document.documentElement.classList.contains(LOCK_CLASS)).toBe(false);
  });

  it('closes on Escape', () => {
    register('floating', 'first', 1);

    const root = document.createElement('div');
    document.body.appendChild(root);
    m.mount(root, FloatingWidgetSection);

    (root.querySelector(toggle) as HTMLElement).click();
    m.redraw.sync();
    expect(root.querySelector(panel)).not.toBeNull();

    pressEscape();
    m.redraw.sync();

    expect(root.querySelector(panel)?.hasAttribute('hidden')).toBe(true);
    expect(document.documentElement.classList.contains(LOCK_CLASS)).toBe(false);
    expect(document.activeElement).toBe(root.querySelector(toggle));

    m.mount(root, null);
    root.remove();
  });

  it('returns focus to the launcher on Escape when widgets register after the dock mounts', () => {
    // The forum mounts the dock in this extension's initializer, usually before
    // other extensions register their widgets, so its first render is empty.
    const root = document.createElement('div');
    document.body.appendChild(root);
    m.mount(root, FloatingWidgetSection);
    expect(root.querySelector(toggle)).toBeNull();

    register('floating', 'first', 1);
    m.redraw.sync();

    (root.querySelector(toggle) as HTMLElement).click();
    m.redraw.sync();
    pressEscape();
    m.redraw.sync();

    expect(root.querySelector(panel)?.hasAttribute('hidden')).toBe(true);
    expect(document.activeElement).toBe(root.querySelector(toggle));

    m.mount(root, null);
    root.remove();
  });

  it('removes the scroll lock and its key listener when torn down while open', () => {
    register('floating', 'first', 1);

    const root = document.createElement('div');
    document.body.appendChild(root);
    m.mount(root, FloatingWidgetSection);

    (root.querySelector(toggle) as HTMLElement).click();
    m.redraw.sync();
    expect(document.documentElement.classList.contains(LOCK_CLASS)).toBe(true);

    m.mount(root, null);
    root.remove();

    expect(document.documentElement.classList.contains(LOCK_CLASS)).toBe(false);
    expect(() => pressEscape()).not.toThrow();
  });
});
