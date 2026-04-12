import app from 'flarum/admin/app';
import Extend from 'flarum/common/extenders';
import WidgetEditor from './components/WidgetEditor';

export default [
  new Extend.Admin() //
    .page(WidgetEditor)
    .setting(() => ({
      setting: 'fof-forum-widgets-core.prefer_data_with_initial_load',
      label: app.translator.trans('fof-forum-widgets-core.admin.settings.prefer_data_with_initial_load'),
      help: app.translator.trans('fof-forum-widgets-core.admin.settings.prefer_data_with_initial_load_help'),
      type: 'boolean',
    })),
];
