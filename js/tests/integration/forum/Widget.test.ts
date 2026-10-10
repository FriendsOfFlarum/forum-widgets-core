import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import m from 'mithril';
import mq from 'mithril-query';
import app from 'flarum/forum/app';
import Widget from '../../../src/common/components/Widget';

beforeAll(() => bootstrapForum());

class StatsWidget extends Widget<any> {
  className() {
    return 'StatsWidget';
  }

  title() {
    return 'Forum statistics';
  }

  description() {
    return 'This month';
  }

  icon() {
    return 'fas fa-chart-bar';
  }

  content() {
    return m('p', '42 discussions');
  }
}

class UntitledWidget extends Widget<any> {
  icon() {
    return 'fas fa-chart-bar';
  }

  content() {
    return m('p', 'Just content');
  }
}

class NoIconWidget extends Widget<any> {
  title() {
    return 'Plain title';
  }
}

/** Written as the README shows: header text from the translator. */
class TranslatedWidget extends Widget<any> {
  title() {
    return app.translator.trans('acme-widgets.forum.widget.title');
  }

  description() {
    return app.translator.trans('acme-widgets.forum.widget.description');
  }
}

describe('Widget', () => {
  it('renders its class name, header and content', () => {
    const widget = mq(StatsWidget, { state: {} });

    expect(widget).toHaveElement('.FofWidgets-Widget.StatsWidget');
    expect(widget).toHaveElement('.FofWidgets-Widget-title-icon .fa-chart-bar');
    expect(widget.first('.FofWidgets-Widget-title-label').textContent).toBe('Forum statistics');
    expect(widget.first('.FofWidgets-Widget-title-desc').textContent).toBe('This month');
    expect(widget.first('.FofWidgets-Widget-content').textContent).toBe('42 discussions');
  });

  it('renders a translated title and description', () => {
    app.translator.addTranslations({
      'acme-widgets.forum.widget.title': 'Translated title',
      'acme-widgets.forum.widget.description': 'Translated description',
    });

    const widget = mq(TranslatedWidget, { state: {} });

    expect(widget.first('.FofWidgets-Widget-title-label').textContent).toBe('Translated title');
    expect(widget.first('.FofWidgets-Widget-title-desc').textContent).toBe('Translated description');
  });

  it('renders no header without a title, even when it has an icon', () => {
    const widget = mq(UntitledWidget, { state: {} });

    expect(widget).not.toHaveElement('.FofWidgets-Widget-title');
    expect(widget).toContainRaw('Just content');
  });

  it('renders the title without an icon when it has none', () => {
    const widget = mq(NoIconWidget, { state: {} });

    expect(widget).toHaveElement('.FofWidgets-Widget-title-label');
    expect(widget).not.toHaveElement('.FofWidgets-Widget-title-icon');
  });
});
