import { jest } from '@jest/globals';
import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import m from 'mithril';
import mq from 'mithril-query';
import app from 'flarum/forum/app';
import PageState from 'flarum/common/states/PageState';
import IndexPage from 'flarum/forum/components/IndexPage';
import Component from 'flarum/common/Component';
import WidgetManager from '../../../src/common/WidgetManager';
import TopWidgetSection from '../../../src/forum/components/TopWidgetSection';
import enableExtensions from '../../enableExtensions';

const SECTION = '.FofWidgets-topWidgetSection';
const END = 'FofWidgets-WidgetSection--endScroll';

class Stub extends Component {
  view() {
    return m('.Stub');
  }
}

beforeAll(() => bootstrapForum());

beforeEach(() => {
  app.widgets = new WidgetManager().addPage(IndexPage);
  app.widgets.setConfig({});
  app.widgets.add({ key: 'news', placement: 'top', position: 0, component: Stub, isDisabled: false, isUnique: true }, 'acme-widgets');
  enableExtensions('acme-widgets');
  app.current = new PageState(IndexPage, { routeName: 'index' });
});

afterEach(() => jest.restoreAllMocks());

/** Mount on a screen size, and give the scrolling strip a 100px window onto 300px of widgets. */
const mount = (screen: string) => {
  jest.spyOn(app, 'screen').mockReturnValue(screen as any);

  const section = mq(TopWidgetSection);
  const strip = section.first(SECTION) as any;

  Object.defineProperty(strip, 'offsetWidth', { value: 100, configurable: true });
  Object.defineProperty(strip, 'scrollWidth', { value: 300, configurable: true });
  strip.scrollLeft = 0;

  return { section, strip };
};

/** Scroll the strip to `left` and count how many times the section re-renders in response. */
const scrollTo = (section: any, strip: any, left: number) => {
  const view = jest.spyOn(TopWidgetSection.prototype, 'view');

  strip.scrollLeft = left;
  section.trigger(SECTION, 'scroll');

  const renders = view.mock.calls.length;
  view.mockRestore();

  return renders;
};

describe('scrolling the top section', () => {
  it('does not re-render on desktop, where the strip does not scroll sideways', () => {
    const { section, strip } = mount('desktop');

    expect(scrollTo(section, strip, 50)).toBe(0);
  });

  it('does not re-render on a phone while the strip stays short of its end', () => {
    const { section, strip } = mount('phone');

    expect(scrollTo(section, strip, 50)).toBe(0);
    expect(scrollTo(section, strip, 120)).toBe(0);
  });

  it('removes the edge fade once scrolled to the end, and restores it when scrolled back', () => {
    const { section, strip } = mount('phone');

    scrollTo(section, strip, 200);
    expect(section.first(SECTION).classList.contains(END)).toBe(true);

    scrollTo(section, strip, 50);
    expect(section.first(SECTION).classList.contains(END)).toBe(false);
  });
});
