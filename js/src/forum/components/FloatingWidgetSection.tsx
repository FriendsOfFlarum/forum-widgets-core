import app from 'flarum/forum/app';
import * as Mithril from 'mithril';
import Component from 'flarum/common/Component';
import Icon from 'flarum/common/components/Icon';
import classList from 'flarum/common/utils/classList';

import sortWidgets from '../../common/utils/sortWidgets';

// While the dock is open this class locks the background scroll (see forum.less).
const LOCK_CLASS = 'FofWidgets-floatingLock';

/**
 * A dock, fixed to the bottom-right of every page, holding the widgets an admin
 * assigned to the `floating` placement. It starts collapsed as a launcher
 * button; clicking it expands a panel with the widget(s) above the button.
 *
 * Unlike the other sections this is not tied to a route or the index sidebar:
 * `forum/index` mounts it on its own root on the document body so it is present
 * everywhere and its open/closed state (and each widget's loaded content)
 * survives SPA navigation instead of remounting on every page change.
 */
export default class FloatingWidgetSection extends Component {
  open: boolean = false;

  onremove(vnode: Mithril.VnodeDOM<{}, this>): void {
    super.onremove(vnode);
    // Never leave the scroll lock behind if the dock is torn down while open.
    document.documentElement.classList.remove(LOCK_CLASS);
  }

  setOpen(open: boolean): void {
    this.open = open;
    // On phones the panel is a full-screen takeover, so lock the background
    // scroll while it is open. The class goes on the scrolling element (<html>)
    // and the rule is scoped to the phone breakpoint, so this is a no-op on
    // desktop where the dock is only a small corner overlay.
    document.documentElement.classList.toggle(LOCK_CLASS, open);
  }

  view(): Mithril.Children {
    const widgets = app.widgets.get('floating');

    // Nothing assigned to the placement: render nothing at all (no empty
    // button hanging in the corner).
    if (!widgets.length) return null;

    return (
      <div
        className={classList('FofWidgets-floatingWidgetSection', {
          'FofWidgets-floatingWidgetSection--open': this.open,
        })}
      >
        {this.open ? (
          <div className="FofWidgets-floatingWidgetSection-panel" role="dialog" aria-modal="false">
            <div className="FofWidgets-floatingWidgetSection-panelBody">
              {sortWidgets(widgets).map((widget) => widget.component.component({ state: widget.state }))}
            </div>
          </div>
        ) : null}
        <button
          type="button"
          className="Button FofWidgets-floatingWidgetSection-toggle"
          aria-expanded={this.open ? 'true' : 'false'}
          aria-label={app.translator.trans(`fof-forum-widgets-core.forum.floating.${this.open ? 'close' : 'open'}`)}
          onclick={() => this.setOpen(!this.open)}
        >
          <Icon name={this.open ? 'fas fa-chevron-down' : 'fas fa-layer-group'} />
        </button>
      </div>
    );
  }
}
