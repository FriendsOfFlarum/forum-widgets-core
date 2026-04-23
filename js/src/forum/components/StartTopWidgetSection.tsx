import app from 'flarum/forum/app';
import * as Mithril from 'mithril';
import Component from 'flarum/common/Component';

import sortWidgets from '../../common/utils/sortWidgets';

export default class StartTopWidgetSection extends Component {
  view(): Mithril.Children {
    if ((app.current.data as any).routeName !== 'index') {
      return null;
    }

    if (!app.widgets.get('start_top').length) return null;

    return (
      <div className="FofWidgets-startTop FofWidgets-WidgetSection">
        {sortWidgets(app.widgets.get('start_top')).map((widget) => widget.component.component({ state: widget.state }))}
      </div>
    );
  }
}
