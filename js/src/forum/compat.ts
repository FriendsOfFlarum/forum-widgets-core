import compat from '../common/compat';

import EndWidgetSection from './components/EndWidgetSection';
import StartTopWidgetSection from './components/StartTopWidgetSection';
import StartBottomWidgetSection from './components/StartBottomWidgetSection';
import TopWidgetSection from './components/TopWidgetSection';
import BottomWidgetSection from './components/BottomWidgetSection';

export default Object.assign(compat, {
  'extensions/fof-forum-widgets-core/forum/components/EndWidgetSection': EndWidgetSection,
  'extensions/fof-forum-widgets-core/forum/components/StartTopWidgetSection': StartTopWidgetSection,
  'extensions/fof-forum-widgets-core/forum/components/StartBottomWidgetSection': StartBottomWidgetSection,
  'extensions/fof-forum-widgets-core/forum/components/TopWidgetSection': TopWidgetSection,
  'extensions/fof-forum-widgets-core/forum/components/BottomWidgetSection': BottomWidgetSection,
});
