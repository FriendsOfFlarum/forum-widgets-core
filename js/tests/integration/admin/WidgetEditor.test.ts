import bootstrapAdmin from '@flarum/jest-config/src/bootstrap/admin';
import { jest } from '@jest/globals';
import mq from 'mithril-query';
import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import WidgetManager from '../../../src/common/WidgetManager';
import WidgetEditor from '../../../src/admin/components/WidgetEditor';
import type { Placement } from '../../../src/common/extend/Widgets';
import enableExtensions from '../../enableExtensions';
import { extend } from '../../../src/admin';

const CORE = 'fof-forum-widgets-core';
const CONFIG = 'fof-forum-widgets-core.config';

const extension = (id: string, title: string) => ({
  id,
  version: '1.0.0',
  description: '',
  icon: { name: 'fas fa-cube' },
  extra: { 'flarum-extension': { title } },
  links: {},
});

class Stub extends Component {
  view() {
    return null;
  }
}

const register = (key: string, placement: Placement, overrides = {}) =>
  app.widgets.add({ key, placement, position: 0, component: Stub, isDisabled: false, isUnique: true, ...overrides }, 'acme-widgets');

/** The `data-id`s of the widgets placed in a section of the layout, in order. */
const placed = (editor: any, section: string): string[] =>
  editor.find(`ol[data-section="${section}"] > li`).map((li: HTMLElement) => li.getAttribute('data-id'));

const storeTile = (editor: any, id: string): HTMLElement => editor.first(`.FoF-ForumWidgets-widgets-store li[data-id="${id}"]`);

const mount = () => mq(WidgetEditor, { id: CORE });

beforeAll(() => {
  bootstrapAdmin({
    dbDriver: 'MySQL',
    extensions: {
      [CORE]: extension(CORE, 'FoF Widgets Core'),
      'acme-widgets': extension('acme-widgets', 'Acme Widgets'),
    },
  });

  extend.forEach((extender: any) => extender.extend(app, { name: CORE, exports: {} }));
  app.boot();

  // As locale/en.yml has it; the fake app loads no locale files.
  app.translator.addTranslations({ 'fof-forum-widgets-core.admin.widget_tooltip': '{widget} — {extension}' });

  // The decorative placeholder bars set a CSS custom property, which the fake DOM mithril-query uses cannot parse.
  jest.spyOn(WidgetEditor.prototype, 'makePlaceholders').mockReturnValue([]);
});

beforeEach(() => {
  app.widgets = new WidgetManager();
  enableExtensions('acme-widgets');
  app.data.settings = { extensions_enabled: JSON.stringify([CORE, 'acme-widgets']) };
  (app.data as any)[`${CORE}.cache_store_writable`] = true;
});

describe('the admin extenders', () => {
  it('register the widget editor as the extension page', () => {
    expect(app.registry.getPage(CORE)).toBe(WidgetEditor);
  });

  it('register the initial-load setting as a checkbox', () => {
    expect(app.registry.getSettings(CORE)).toEqual([
      expect.objectContaining({ setting: 'fof-forum-widgets-core.prefer_data_with_initial_load', type: 'boolean' }),
    ]);
  });
});

describe('WidgetEditor', () => {
  it('lays each widget out in its registered section when nothing is saved', () => {
    register('news', 'top');
    register('stats', 'end');
    register('online', 'start_top');

    const editor = mount();

    expect(placed(editor, 'top')).toEqual(['acme-widgets:news']);
    expect(placed(editor, 'end')).toEqual(['acme-widgets:stats']);
    expect(placed(editor, 'start_top')).toEqual(['acme-widgets:online']);
    expect(placed(editor, 'bottom')).toEqual([]);
    expect(placed(editor, 'start_bottom')).toEqual([]);
  });

  it('lays widgets out as saved, in their saved order', () => {
    register('news', 'top');
    register('stats', 'end');
    app.data.settings[CONFIG] = JSON.stringify({
      instances: [
        { id: 'acme-widgets:stats', extension: 'acme-widgets', key: 'stats', placement: 'bottom', position: 0 },
        { id: 'acme-widgets:news', extension: 'acme-widgets', key: 'news', placement: 'bottom', position: 1 },
      ],
    });

    const editor = mount();

    expect(placed(editor, 'bottom')).toEqual(['acme-widgets:stats', 'acme-widgets:news']);
    expect(placed(editor, 'top')).toEqual([]);
    expect(placed(editor, 'end')).toEqual([]);
  });

  it('lays widgets out as registered when the saved layout is not valid JSON', () => {
    register('news', 'top');
    app.data.settings[CONFIG] = '{"instances": [';

    expect(placed(mount(), 'top')).toEqual(['acme-widgets:news']);
  });

  it('places widgets that are hidden on the forum, so the admin can still arrange them', () => {
    register('news', 'top', { isDisabled: true });

    expect(placed(mount(), 'top')).toEqual(['acme-widgets:news']);
  });

  it('leaves widgets the admin removed out of the layout', () => {
    register('news', 'top');
    app.data.settings[CONFIG] = JSON.stringify({ disabled: ['acme-widgets:news'] });

    expect(placed(mount(), 'top')).toEqual([]);
  });

  it("shows each widget's extension in the layout and in the store", () => {
    register('news', 'top');

    const editor = mount();

    expect(editor.first('ol[data-section="top"] .FoF-ForumWidgets-Widget-title').textContent).toBe('Acme Widgets');
    expect(storeTile(editor, 'acme-widgets:news').textContent).toBe('Acme Widgets');
  });

  it('labels a widget with its own title and icon when it gives them, in the layout and in the store', () => {
    register('news', 'top', { title: 'Latest news', icon: 'fas fa-newspaper' });

    const editor = mount();
    const tile = editor.first('ol[data-section="top"] .FoF-ForumWidgets-Widget');

    expect(tile.querySelector('.FoF-ForumWidgets-Widget-title').textContent).toBe('Latest news');
    expect(tile.querySelector('.FoF-ForumWidgets-Widget-icon i').className).toContain('fa-newspaper');
    // The full label and where it comes from are on hover, as a cut-short tile needs.
    expect(tile.getAttribute('title')).toBe('Latest news — Acme Widgets');
    expect(storeTile(editor, 'acme-widgets:news').textContent).toBe('Latest news');
    expect(storeTile(editor, 'acme-widgets:news').querySelector('.FoF-ForumWidgets-Widget-icon i').className).toContain('fa-newspaper');
  });

  it('accepts a translated label, which is an array rather than a string', () => {
    register('news', 'top', { title: ['Latest', ' news'] });

    const tile = mount().first('ol[data-section="top"] .FoF-ForumWidgets-Widget');

    expect(tile.querySelector('.FoF-ForumWidgets-Widget-title').textContent).toBe('Latest news');
    expect(tile.getAttribute('title')).toBe('Latest news — Acme Widgets');
  });

  it('tells apart several widgets from one extension', () => {
    register('news', 'end', { title: 'Latest news' });
    register('stats', 'end', { title: 'Statistics' });

    const titles = mount()
      .find('ol[data-section="end"] .FoF-ForumWidgets-Widget-title')
      .map((el: HTMLElement) => el.textContent);

    expect(titles).toEqual(['Latest news', 'Statistics']);
  });

  it("keeps a widget's own label when it is placed from a saved layout", () => {
    register('news', 'top', { title: 'Latest news' });
    app.data.settings[CONFIG] = JSON.stringify({
      instances: [{ id: 'acme-widgets:news', extension: 'acme-widgets', key: 'news', placement: 'bottom', position: 0 }],
    });

    expect(mount().first('ol[data-section="bottom"] .FoF-ForumWidgets-Widget-title').textContent).toBe('Latest news');
  });

  it("falls back to the extension's icon and title for a widget that gives neither", () => {
    register('news', 'top');

    const tile = mount().first('ol[data-section="top"] .FoF-ForumWidgets-Widget');

    expect(tile.querySelector('.FoF-ForumWidgets-Widget-icon i').className).toContain('fa-cube');
    expect(tile.querySelector('.FoF-ForumWidgets-Widget-title').textContent).toBe('Acme Widgets');
    expect(tile.getAttribute('title')).toBe('Acme Widgets');
  });

  /** Run `test` with the acme extension's icon swapped out, then put the original back. */
  const withExtensionIcon = (icon: any, test: () => void) => {
    const ext = app.data.extensions['acme-widgets'] as any;
    const original = ext.icon;
    ext.icon = icon;
    try {
      test();
    } finally {
      ext.icon = original;
    }
  };

  it("shows a widget's own icon when its extension has none", () => {
    withExtensionIcon(undefined, () => {
      register('news', 'top', { icon: 'fas fa-newspaper' });

      expect(mount().first('ol[data-section="top"] .FoF-ForumWidgets-Widget-icon i').className).toContain('fa-newspaper');
    });
  });

  it("replaces an extension's image icon with the widget's own, rather than drawing over it", () => {
    withExtensionIcon({ backgroundImage: "url('acme.png')", backgroundColor: '#123456' }, () => {
      register('news', 'top', { icon: 'fas fa-newspaper' });
      register('stats', 'end');

      const editor = mount();
      const own = editor.first('ol[data-section="top"] .FoF-ForumWidgets-Widget-icon') as HTMLElement;
      const inherited = editor.first('ol[data-section="end"] .FoF-ForumWidgets-Widget-icon') as HTMLElement;

      expect(own.style.backgroundImage).toBe('');
      expect(own.style.backgroundColor).not.toBe('');
      expect(own.querySelector('i')!.className).toContain('fa-newspaper');
      // A widget without its own icon keeps the extension's image, as before.
      expect(inherited.style.backgroundImage).toContain('acme.png');
      expect(inherited.querySelector('i')).toBeFalsy();
    });
  });

  it('calls a label given as a callback, so an admin translation key works', () => {
    app.translator.addTranslations({ 'acme-widgets.admin.news_widget': 'Translated news' });
    register('news', 'top', { title: () => app.translator.trans('acme-widgets.admin.news_widget') });

    const tile = mount().first('ol[data-section="top"] .FoF-ForumWidgets-Widget');

    expect(tile.querySelector('.FoF-ForumWidgets-Widget-title').textContent).toBe('Translated news');
    expect(tile.getAttribute('title')).toBe('Translated news — Acme Widgets');
  });

  it("falls back to the extension's title for an empty label", () => {
    register('news', 'top', { title: [] });
    register('stats', 'end', { title: () => '  ' });

    const editor = mount();

    for (const section of ['top', 'end']) {
      const tile = editor.first(`ol[data-section="${section}"] .FoF-ForumWidgets-Widget`);
      expect(tile.querySelector('.FoF-ForumWidgets-Widget-title').textContent).toBe('Acme Widgets');
      expect(tile.getAttribute('title')).toBe('Acme Widgets');
    }
  });

  it('keeps the extension title on hover for a widget that gives only an icon', () => {
    register('news', 'top', { icon: 'fas fa-newspaper' });

    expect(mount().first('ol[data-section="top"] .FoF-ForumWidgets-Widget').getAttribute('title')).toBe('Acme Widgets');
  });

  it('lets a unique widget be taken from the store only while it is out of the layout', () => {
    register('placed', 'top');
    register('removed', 'end');
    app.data.settings[CONFIG] = JSON.stringify({ disabled: ['acme-widgets:removed'] });

    const editor = mount();

    expect(storeTile(editor, 'acme-widgets:placed').hasAttribute('disabled')).toBe(true);
    expect(storeTile(editor, 'acme-widgets:removed').hasAttribute('disabled')).toBe(false);
  });

  it('leaves widgets of disabled extensions out of the store', () => {
    app.widgets.add({ key: 'gone', placement: 'top', position: 0, component: Stub, isDisabled: false, isUnique: true }, 'acme-uninstalled');

    expect(mount()).not.toHaveElement('.FoF-ForumWidgets-widgets-store li[data-id="acme-uninstalled:gone"]');
  });

  it('renders the registered settings below the editor', () => {
    expect(mount()).toHaveElement('input[type="checkbox"]');
  });

  it('offers to reset its registered settings, as core extension pages do', () => {
    const show = jest.spyOn(app.modal, 'show').mockImplementation(() => {});

    mount().click('.Form-controls .Button--danger');

    expect(show).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        extensionId: CORE,
        settings: [expect.objectContaining({ key: 'fof-forum-widgets-core.prefer_data_with_initial_load' })],
      })
    );

    show.mockRestore();
  });

  it('warns when the cache directory is not writable', () => {
    (app.data as any)[`${CORE}.cache_store_writable`] = false;

    expect(mount()).toHaveElement('.Alert--error');
  });

  it('does not warn when the cache directory is writable', () => {
    expect(mount()).not.toHaveElement('.Alert--error');
  });
});
