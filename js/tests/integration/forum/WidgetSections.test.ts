import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import m from 'mithril';
import mq from 'mithril-query';
import app from 'flarum/forum/app';
import PageState from 'flarum/common/states/PageState';
import IndexPage from 'flarum/forum/components/IndexPage';
import Component from 'flarum/common/Component';
import WidgetManager from '../../../src/common/WidgetManager';
import type { Placement } from '../../../src/common/extend/Widgets';
import enableExtensions from '../../enableExtensions';
import TopWidgetSection from '../../../src/forum/components/TopWidgetSection';
import BottomWidgetSection from '../../../src/forum/components/BottomWidgetSection';
import EndWidgetSection from '../../../src/forum/components/EndWidgetSection';
import StartTopWidgetSection from '../../../src/forum/components/StartTopWidgetSection';
import StartBottomWidgetSection from '../../../src/forum/components/StartBottomWidgetSection';

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

const onRoute = (routeName: string) => {
  app.current = new PageState(IndexPage, { routeName });
};

const sections: [Placement, any, string][] = [
  ['top', TopWidgetSection, '.FofWidgets-topWidgetSection'],
  ['bottom', BottomWidgetSection, '.FofWidgets-bottomWidgetSection'],
  ['end', EndWidgetSection, '.FofWidgets-sideNavAlt'],
  ['start_top', StartTopWidgetSection, '.FofWidgets-startTop'],
  ['start_bottom', StartBottomWidgetSection, '.FofWidgets-startBottom'],
];

describe.each(sections)('the %s section', (placement, Section, selector) => {
  beforeEach(() => {
    app.widgets = new WidgetManager();
    app.widgets.setConfig({});
    enableExtensions('acme-widgets');
    onRoute('index');
  });

  it('renders its widgets in position order on the discussion list', () => {
    register(placement, 'second', 2);
    register(placement, 'first', 1);

    const section = mq(Section);

    expect(section).toHaveElement(`${selector}.FofWidgets-WidgetSection`);
    expect(section.find('.KeyWidget').map((node: any) => node.textContent)).toEqual(['first', 'second']);
  });

  it('hands each widget its persistent state', () => {
    register(placement, 'first', 1);

    mq(Section);

    expect(app.widgets.states['acme-widgets:first']).toEqual({ rendered: true });
  });

  it('only renders the widgets placed in it', () => {
    register(placement, 'mine', 1);
    register(placement === 'end' ? 'top' : 'end', 'elsewhere', 1);

    const section = mq(Section);

    expect(section.find('.KeyWidget').map((node: any) => node.textContent)).toEqual(['mine']);
  });

  it('renders nothing when it has no widgets', () => {
    register(placement === 'end' ? 'top' : 'end', 'elsewhere', 1);

    expect(mq(Section)).not.toHaveElement(selector);
  });

  it.each(['discussion', 'user.posts', 'tags'])('renders nothing on the %s route', (routeName) => {
    register(placement, 'first', 1);
    onRoute(routeName);

    expect(mq(Section)).not.toHaveElement(selector);
  });
});
