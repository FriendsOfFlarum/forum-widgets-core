import app from 'flarum/forum/app';
import * as Mithril from 'mithril';
import Component from 'flarum/common/Component';
import Stream from 'flarum/common/utils/Stream';
import classList from 'flarum/common/utils/classList';

import sortWidgets from '../../common/utils/sortWidgets';

export default class TopWidgetSection extends Component {
  scrollEnd: Stream<boolean>;

  oninit(vnode: Mithril.Vnode): void {
    super.oninit(vnode);

    this.scrollEnd = Stream(false);
  }

  view(): Mithril.Children {
    const isSmallScreen = ['phone', 'tablet'].includes(app.screen());

    return (
      <div
        className={classList({
          'FofWidgets-topWidgetSection FofWidgets-WidgetSection': true,
          'FofWidgets-WidgetSection--endScroll': isSmallScreen && this.scrollEnd(),
        })}
        onscroll={(e: Event) => {
          if (isSmallScreen) {
            this.scrollEnd(false);

            const target = e.target as HTMLElement;
            if (target.offsetWidth + target.scrollLeft >= target.scrollWidth) {
              this.scrollEnd(true);
            }
          }
        }}
      >
        {sortWidgets(app.widgets.get('top')).map((widget) => widget.component.component({ state: widget.state }))}
      </div>
    );
  }
}
