import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import m from 'mithril';
import mq from 'mithril-query';
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

describe('Widget', () => {
  it('renders its class name, header and content', () => {
    const widget = mq(StatsWidget, { state: {} });

    expect(widget).toHaveElement('.FofWidgets-Widget.StatsWidget');
    expect(widget).toHaveElement('.FofWidgets-Widget-title-icon .fa-chart-bar');
    expect(widget.first('.FofWidgets-Widget-title-label').textContent).toBe('Forum statistics');
    expect(widget.first('.FofWidgets-Widget-title-desc').textContent).toBe('This month');
    expect(widget.first('.FofWidgets-Widget-content').textContent).toBe('42 discussions');
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
