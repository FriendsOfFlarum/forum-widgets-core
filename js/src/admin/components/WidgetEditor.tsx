import Form from 'flarum/common/components/Form';
import app from 'flarum/admin/app';
import sortable from 'sortablejs';
import type Mithril from 'mithril';
import ExtensionPage, { ExtensionPageAttrs } from 'flarum/admin/components/ExtensionPage';
import Icon from 'flarum/common/components/Icon';

import sortWidgets from '../../common/utils/sortWidgets';
import type { Widget } from '../../common/extend/Widgets';
import Alert from 'flarum/common/components/Alert';

interface WidgetEditorAttrs extends ExtensionPageAttrs {}

export default class WidgetEditor extends ExtensionPage<WidgetEditorAttrs> {
  static settingKey = 'fof-forum-widgets-core.config';

  private config?: any;
  private placeholderCache: any = {};

  oninit(vnode: Mithril.Vnode<WidgetEditorAttrs, this>): void {
    super.oninit(vnode);

    this.config = this.getConfig();
    app.widgets.setConfig(this.config);
  }

  content() {
    const settings = app.registry.getSettings(this.extension.id);

    return (
      <div className="ExtensionPage-settings">
        <div className="container">
          {!app.data['fof-forum-widgets-core.cache_store_writable'] ? (
            <Alert type="error">{app.translator.trans('fof-forum-widgets-core.admin.cache_not_writable_warning')}</Alert>
          ) : null}
          <Form>
            <div className="Form-group">{this.editor()}</div>
            {settings ? settings.map(this.buildSettingComponent.bind(this)) : null}
            <div className="Form-group">{this.submitButton()}</div>
          </Form>
        </div>
      </div>
    );
  }

  editor(): Mithril.Children {
    return (
      <div className="FoF-ForumWidgets-editor" oncreate={this.createEditorSections.bind(this)} onbeforeupdate={() => false}>
        <div className="FoF-ForumWidgets-layout">
          <div className="FoF-ForumWidgets-layout-header FoF-ForumWidgets-layout-concrete">
            <div className="FoF-ForumWidgets-layout-container FoF-ForumWidgets-layout-headerWrapper">
              <div className="FoF-ForumWidgets-layout-placeholder FoF-ForumWidgets-layout-placeholder--header" />
              <div className="FoF-ForumWidgets-layout-placeholderGroup">
                <div className="FoF-ForumWidgets-layout-placeholder FoF-ForumWidgets-layout-placeholder--icon" />
                <div className="FoF-ForumWidgets-layout-placeholder FoF-ForumWidgets-layout-placeholder--icon" />
              </div>
            </div>
          </div>
          <div className="FoF-ForumWidgets-layout-hero FoF-ForumWidgets-layout-concrete">
            <div className="FoF-ForumWidgets-layout-placeholder FoF-ForumWidgets-layout-placeholder--header" />
            <div className="FoF-ForumWidgets-layout-placeholder" />
            <div className="FoF-ForumWidgets-layout-placeholder FoF-ForumWidgets-layout-placeholder--long" />
          </div>
          <div className="FoF-ForumWidgets-layout-contentWrapper FoF-ForumWidgets-layout-container">
            <div className="FoF-ForumWidgets-layout-topSection FoF-ForumWidgets-layout-section">
              <ol data-section="top" className="FoF-ForumWidgets-layout-section-items">
                {sortWidgets(app.widgets.get('top', true)).map((widget: Widget) => this.layoutWidget(widget))}
              </ol>
            </div>
            <div className="FoF-ForumWidgets-layout-sideNavContainer">
              <div className="FoF-ForumWidgets-layout-sideNavWrapper">
                <div className="FoF-ForumWidgets-layout-startTopSection FoF-ForumWidgets-layout-section">
                  <ol data-section="start_top" className="FoF-ForumWidgets-layout-section-items">
                    {sortWidgets(app.widgets.get('start_top', true)).map((widget: Widget) => this.layoutWidget(widget))}
                  </ol>
                </div>
                <div className="FoF-ForumWidgets-layout-sideNav FoF-ForumWidgets-layout-concrete">
                  <div className="FoF-ForumWidgets-layout-placeholder FoF-ForumWidgets-layout-placeholder--button">
                    <div className="FoF-ForumWidgets-layout-placeholder" />
                  </div>
                  {this.makePlaceholders('sidenav', 8, 20, 80).map((placeholder: Mithril.Children) => (
                    <div className="FoF-ForumWidgets-layout-placeholderGroup">
                      <div className="FoF-ForumWidgets-layout-placeholder FoF-ForumWidgets-layout-placeholder--icon" />
                      {placeholder}
                    </div>
                  ))}
                </div>
                <div className="FoF-ForumWidgets-layout-startBottomSection FoF-ForumWidgets-layout-section">
                  <ol data-section="start_bottom" className="FoF-ForumWidgets-layout-section-items">
                    {sortWidgets(app.widgets.get('start_bottom', true)).map((widget: Widget) => this.layoutWidget(widget))}
                  </ol>
                </div>
              </div>
              <div className="FoF-ForumWidgets-layout-sideNavOffset FoF-ForumWidgets-layout-concrete">
                {this.makePlaceholders('sideNavOffset', 6, 20, 80).map((placeholder: Mithril.Children) => (
                  <div className="FoF-ForumWidgets-layout-placeholderGroup">
                    <div className="FoF-ForumWidgets-layout-placeholder FoF-ForumWidgets-layout-placeholder--icon"></div>
                    <div className="FoF-ForumWidgets-layout-placeholderGroup-content">
                      {placeholder}
                      {this.makePlaceholders('discussion', 1, 20, 50)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="FoF-ForumWidgets-layout-sideNavAlt FoF-ForumWidgets-layout-section">
                <ol data-section="end" className="FoF-ForumWidgets-layout-section-items">
                  {sortWidgets(app.widgets.get('end', true)).map((widget: Widget) => this.layoutWidget(widget))}
                </ol>
              </div>
            </div>
            <div className="FoF-ForumWidgets-layout-bottomSection FoF-ForumWidgets-layout-section">
              <ol data-section="bottom" className="FoF-ForumWidgets-layout-section-items">
                {sortWidgets(app.widgets.get('bottom', true)).map((widget: Widget) => this.layoutWidget(widget))}
              </ol>
            </div>
            <div className="FoF-ForumWidgets-layout-floating">
              <span className="FoF-ForumWidgets-layout-floating-label">{app.translator.trans('fof-forum-widgets-core.admin.editor.floating')}</span>
              <div className="FoF-ForumWidgets-layout-floatingSection FoF-ForumWidgets-layout-section">
                <ol data-section="floating" className="FoF-ForumWidgets-layout-section-items">
                  {sortWidgets(app.widgets.get('floating', true)).map((widget: Widget) => this.layoutWidget(widget))}
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div className="FoF-ForumWidgets-widgets">
          <ol data-section="store" className="FoF-ForumWidgets-widgets-store">
            {app.widgets.widgets
              .filter((widget: Widget) => app.data.extensions[widget.extension!])
              .map((widget: Widget, index: number) => {
                const attrs = {};
                const available = this.isWidgetAvailable(widget);

                return (
                  <li data-id={widget.id} data-section="store" disabled={!available} key={index}>
                    {this.widget(widget)}
                  </li>
                );
              })}
          </ol>
        </div>
      </div>
    );
  }

  createEditorSections(): void {
    this.$('.FoF-ForumWidgets-layout-section-items, .FoF-ForumWidgets-widgets-store')
      .get()
      .map((e) => {
        const section = $(e).data('section');

        sortable.create(e, {
          group: {
            name: section,
            pull: () => {
              return section === 'store' ? 'clone' : true;
            },
            put: true,
          },
          sort: section !== 'store',
          filter: '[disabled]',
          animation: 150,
          // swapThreshold: 0.65,
          dragClass: 'sortable-dragging',
          ghostClass: section !== 'store' ? 'sortable-placeholder' : '',
          onSort: this.onSortUpdate.bind(this),
          onClone: (e) => {
            $(e.clone).attr('disabled', 'disabled');
          },
          onAdd: (e) => {
            if (section === 'store') {
              this.setConfig({
                ...this.config,
                disabled: [...(this.config.disabled || []), e.item.dataset.id],
              });

              e.item.parentNode?.removeChild(e.item);
              (this.$(`.FoF-ForumWidgets-widgets-store li[data-id="${e.item.dataset.id}"]`) as any).removeAttr('disabled');
            }
          },
          onRemove: (e) => {
            if (section === 'store') {
              this.setConfig({
                ...this.config,
                disabled: (this.config.disabled || []).filter((wid: string) => wid !== e.item.dataset.id),
              });
            }
          },
        });
      });
  }

  widget(widget: Widget, placed: boolean = false): Mithril.Children {
    const extension = app.data.extensions[widget.extension!];

    return (
      <div className="FoF-ForumWidgets-Widget-container">
        <div className="FoF-ForumWidgets-Widget">
          <span className="FoF-ForumWidgets-Widget-icon ExtensionIcon" style={extension.icon}>
            {extension.icon ? <Icon name={extension.icon.name} /> : ''}
          </span>
          <span className="FoF-ForumWidgets-Widget-title">{extension.extra['flarum-extension'].title}</span>
        </div>
      </div>
    );
  }

  layoutWidget(widget: Widget): Mithril.Children {
    return (
      <li
        className="FoF-ForumWidgets-layout-widget"
        data-id={widget.id}
        data-section={widget.placement}
        data-key={widget.key}
        data-extension={widget.extension}
        key={widget.id}
      >
        {this.widget(widget, true)}
      </li>
    );
  }

  onSortUpdate(): void {
    const instances: any[] = [];

    this.$('.FoF-ForumWidgets-layout-section-items')
      .get()
      .map((sectionElement) => {
        const section = sectionElement.dataset.section;

        Array.from(sectionElement.children).map((widgetElement, i: number) => {
          const el = widgetElement as HTMLElement;
          instances.push({
            id: el.dataset.id,
            extension: el.dataset.extension,
            key: el.dataset.key,
            placement: sectionElement.dataset.section,
            position: i,
          });
        });
      });

    this.setConfig({
      ...this.config,
      instances,
    });
  }

  isWidgetAvailable(widget: Widget): boolean {
    const disabled = this.config.disabled || [];

    return disabled.includes(widget.id) && widget.isUnique;
  }

  makePlaceholders(key: string, count: number = 1, minWidth?: number, maxWidth?: number): Mithril.Vnode[] {
    if (this.placeholderCache[key]) return this.placeholderCache[key];

    return (this.placeholderCache[key] = Array(count)
      .fill(null)
      .map(() => (
        <div
          className="FoF-ForumWidgets-layout-placeholder"
          style={
            minWidth && maxWidth
              ? {
                  '--width': Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth + '%',
                }
              : {}
          }
        />
      )));
  }

  getConfig(): any {
    return JSON.parse(this.setting(WidgetEditor.settingKey)() || '{}');
  }

  setConfig(config: any): void {
    this.config = config;
    app.widgets.setConfig(config);
    this.setting(WidgetEditor.settingKey)(JSON.stringify(config));
    m.redraw();
  }
}
