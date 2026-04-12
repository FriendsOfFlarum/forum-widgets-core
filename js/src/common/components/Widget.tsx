import * as Mithril from 'mithril';
import Component, { ComponentAttrs } from 'flarum/common/Component';
import classList from 'flarum/common/utils/classList';
import Icon from 'flarum/common/components/Icon';

export interface WidgetAttrs extends ComponentAttrs {
  state: any;
}

export default class Widget<T extends WidgetAttrs> extends Component<T> {
  view(): Mithril.Children {
    return (
      <div className={classList(['FofWidgets-Widget', this.className()])}>
        {this.header()}
        <div className="FofWidgets-Widget-content">{this.content()}</div>
      </div>
    );
  }

  header(): Mithril.Children {
    const iconName = this.icon();
    const title = this.title();

    return title ? (
      <div className="FofWidgets-Widget-title">
        {iconName ? (
          <span className="FofWidgets-Widget-title-icon">
            <Icon name={iconName} />
          </span>
        ) : null}
        <span className="FofWidgets-Widget-title-label">{title}</span>
        <div className="FofWidgets-Widget-title-desc">{this.description()}</div>
      </div>
    ) : null;
  }

  className(): string {
    return '';
  }

  title(): string {
    return '';
  }

  description(): string {
    return '';
  }

  icon(): string {
    return '';
  }

  content(): Mithril.Children {
    return '';
  }
}
