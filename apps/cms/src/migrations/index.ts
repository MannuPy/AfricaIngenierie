import * as migration_20260826_193331_initial_schema from './20260826_193331_initial_schema';
import * as migration_20260827_030123_demo_flag from './20260827_030123_demo_flag';
import * as migration_20260827_080855_media_demo_key from './20260827_080855_media_demo_key';
import * as migration_20260827_185816_admin_form_cleanup from './20260827_185816_admin_form_cleanup';
import * as migration_20260828_120000_production_indexes from './20260828_120000_production_indexes';

export const migrations = [
  {
    up: migration_20260826_193331_initial_schema.up,
    down: migration_20260826_193331_initial_schema.down,
    name: '20260826_193331_initial_schema',
  },
  {
    up: migration_20260827_030123_demo_flag.up,
    down: migration_20260827_030123_demo_flag.down,
    name: '20260827_030123_demo_flag',
  },
  {
    up: migration_20260827_080855_media_demo_key.up,
    down: migration_20260827_080855_media_demo_key.down,
    name: '20260827_080855_media_demo_key',
  },
  {
    up: migration_20260827_185816_admin_form_cleanup.up,
    down: migration_20260827_185816_admin_form_cleanup.down,
    name: '20260827_185816_admin_form_cleanup'
  },
  {
    up: migration_20260828_120000_production_indexes.up,
    down: migration_20260828_120000_production_indexes.down,
    name: '20260828_120000_production_indexes'
  },
];
