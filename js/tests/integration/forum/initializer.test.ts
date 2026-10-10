import { jest } from '@jest/globals';
import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import { makeUser } from '@flarum/jest-config/factory';
import m from 'mithril';
import mq from 'mithril-query';
import app from 'flarum/forum/app';
import PageState from 'flarum/common/states/PageState';
import ExportRegistry from 'flarum/common/ExportRegistry';
import IndexPage from 'flarum/forum/components/IndexPage';
import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import PageStructure from 'flarum/forum/components/PageStructure';
import Page from 'flarum/common/components/Page';
import Component from 'flarum/common/Component';
import WidgetManager from '../../../src/common/WidgetManager';
import type { Placement } from '../../../src/common/extend/Widgets';
import enableExtensions from '../../enableExtensions';
import '../../../src/forum';

class KeyWidget extends Component {
  view() {
    return m('.KeyWidget');
  }
}

/** A page that is not a discussion list but still has the index sidebar, like the tags page. */
class OtherPage extends Page {}

const register = (key: string, placement: Placement) =>
  app.widgets.add({ key, placement, position: 0, component: KeyWidget, isDisabled: false, isUnique: true }, 'acme-widgets');

/** The class names of the direct children of the first element matching `selector`. */
const childClasses = (page: any, selector: string): string[] => Array.from(page.first(selector).children).map((el: any) => el.className);

beforeAll(() => {
  bootstrapForum({
    resources: [
      {
        type: 'forums',
        id: '1',
        attributes: {
          'fof-forum-widgets-core.config': {
            instances: [{ id: 'acme-widgets:saved', extension: 'acme-widgets', key: 'saved', placement: 'bottom', position: 0 }],
          },
        },
      },
      makeUser({ id: '1', attributes: { username: 'admin', displayName: 'Admin' } }),
    ],
  });

  // The extension's own initializer, as the forum runs it before boot.
  app.initializers.get('fof/forum-widgets-core')(app);
  app.boot();
});

beforeEach(() => {
  enableExtensions('acme-widgets');
  app.current = new PageState(IndexPage, { routeName: 'index' });
});

describe('the forum initializer', () => {
  it('creates app.widgets with the layout saved in the forum payload', () => {
    expect(app.widgets).toBeInstanceOf(WidgetManager);

    app.widgets.widgets = [];
    register('saved', 'end');

    expect(app.widgets.get('end')).toEqual([]);
    expect(app.widgets.get('bottom').map((w) => w.id)).toEqual(['acme-widgets:saved']);
  });

  it('shows widgets on every discussion list', () => {
    for (const routeName of ['index', 'tag', 'following']) {
      app.current = new PageState(IndexPage, { routeName });

      expect(app.widgets.onWidgetPage()).toBe(true);
    }

    app.current = new PageState(OtherPage, { routeName: 'tags' });

    expect(app.widgets.onWidgetPage()).toBe(false);
  });

  it("shows widgets on a page added by its module path, once that page's extension has loaded", () => {
    // The test environment stubs `checkModule` to always return true; restore core's lookup.
    jest.spyOn(flarum.reg, 'checkModule').mockImplementation(function (this: any, namespace: string, id: string) {
      return ExportRegistry.prototype.checkModule.call(this, namespace, id);
    });

    class ExamplePage extends Page {}

    const widgets = new WidgetManager().addPage('ext:acme/example/forum/components/ExamplePage');
    app.current = new PageState(ExamplePage, { routeName: 'example' });

    expect(widgets.onWidgetPage()).toBe(false);

    flarum.reg.add('acme-example', 'forum/components/ExamplePage', ExamplePage);

    expect(widgets.onWidgetPage()).toBe(true);

    jest.restoreAllMocks();
  });

  describe('the page', () => {
    beforeEach(() => {
      app.widgets.widgets = [];
      app.widgets.setConfig({});
    });

    it('puts the top section between the hero and the page container, and the bottom section after it', () => {
      register('top', 'top');
      register('bottom', 'bottom');

      const page = mq(PageStructure, { className: 'IndexPage' }, m('p', 'discussion list'));

      expect(childClasses(page, '.Page-main')).toEqual([
        'sr-only sr-only-focusable-custom',
        'Page-hero',
        'container',
        'Page-container container',
        'container',
      ]);
      expect(page).toHaveElement('.Page-main > .container > .FofWidgets-topWidgetSection');
      expect(page).toHaveElement('.Page-main > .container > .FofWidgets-bottomWidgetSection');
    });

    it('puts the end section after the page content', () => {
      register('end', 'end');

      const page = mq(PageStructure, { className: 'IndexPage' }, m('p', 'discussion list'));

      expect(childClasses(page, '.Page-container')).toEqual(['Page-sidebar', 'Page-content', 'FofWidgets-sideNavAlt FofWidgets-WidgetSection']);
    });
  });

  describe('the sidebar', () => {
    beforeEach(() => {
      app.widgets.widgets = [];
      app.widgets.setConfig({});
    });

    it('adds the start sections around the navigation when they have widgets', () => {
      register('startTop', 'start_top');
      register('startBottom', 'start_bottom');

      const sidebar = mq(IndexSidebar);

      expect(sidebar).toHaveElement('.item-startTopWidgetSection .FofWidgets-startTop');
      expect(sidebar).toHaveElement('.item-startBottomWidgetSection .FofWidgets-startBottom');

      const items = (sidebar.first('ul') as any).children as HTMLElement[];
      const keys = Array.from(items).map((el) => el.className);

      expect(keys[0]).toContain('item-startTopWidgetSection');
      expect(keys[keys.length - 1]).toContain('item-startBottomWidgetSection');
    });

    it('adds no empty sidebar items when the start sections have no widgets', () => {
      register('end', 'end');

      const sidebar = mq(IndexSidebar);

      expect(sidebar).not.toHaveElement('.item-startTopWidgetSection');
      expect(sidebar).not.toHaveElement('.item-startBottomWidgetSection');
    });

    it('adds no start sections on a page that does not show widgets', () => {
      register('startTop', 'start_top');
      register('startBottom', 'start_bottom');
      app.current = new PageState(OtherPage, { routeName: 'tags' });

      const sidebar = mq(IndexSidebar);

      expect(sidebar).not.toHaveElement('.item-startTopWidgetSection');
      expect(sidebar).not.toHaveElement('.item-startBottomWidgetSection');
    });
  });
});
