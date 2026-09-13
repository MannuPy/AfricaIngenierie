import * as migration_20260826_193331_initial_schema from './20260826_193331_initial_schema';
import * as migration_20260827_030123_demo_flag from './20260827_030123_demo_flag';
import * as migration_20260827_080855_media_demo_key from './20260827_080855_media_demo_key';
import * as migration_20260827_185816_admin_form_cleanup from './20260827_185816_admin_form_cleanup';
import * as migration_20260828_120000_production_indexes from './20260828_120000_production_indexes';
import * as migration_20260902_170000_footer_testimonial_cta from './20260902_170000_footer_testimonial_cta';
import * as migration_20260904_120000_translation_display_fixes from './20260904_120000_translation_display_fixes';
import * as migration_20260904_123000_public_locale_cleanup from './20260904_123000_public_locale_cleanup';
import * as migration_20260904_124000_partner_translation_versions from './20260904_124000_partner_translation_versions';
import * as migration_20260904_125000_site_logo_alt_cleanup from './20260904_125000_site_logo_alt_cleanup';
import * as migration_20260904_130000_testimonial_company_locales from './20260904_130000_testimonial_company_locales';
import * as migration_20260904_140000_key_figures_translation_cleanup from './20260904_140000_key_figures_translation_cleanup';
import * as migration_20260904_150000_key_figures_visibility from './20260904_150000_key_figures_visibility';
import * as migration_20260904_170000_contact_phone_map from './20260904_170000_contact_phone_map';
import * as migration_20260905_175951_homepage_video_hero from './20260905_175951_homepage_video_hero';
import * as migration_20260905_181000_fix_homepage_version_visibility from './20260905_181000_fix_homepage_version_visibility';
import * as migration_20260906_002217 from './20260906_002217';
import * as migration_20260907_090000_audit_traceability from './20260907_090000_audit_traceability';
import * as migration_20260912_100000_public_media_gate from './20260912_100000_public_media_gate';

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
    name: '20260827_185816_admin_form_cleanup',
  },
  {
    up: migration_20260828_120000_production_indexes.up,
    down: migration_20260828_120000_production_indexes.down,
    name: '20260828_120000_production_indexes',
  },
  {
    up: migration_20260902_170000_footer_testimonial_cta.up,
    down: migration_20260902_170000_footer_testimonial_cta.down,
    name: '20260902_170000_footer_testimonial_cta',
  },
  {
    up: migration_20260904_120000_translation_display_fixes.up,
    down: migration_20260904_120000_translation_display_fixes.down,
    name: '20260904_120000_translation_display_fixes',
  },
  {
    up: migration_20260904_123000_public_locale_cleanup.up,
    down: migration_20260904_123000_public_locale_cleanup.down,
    name: '20260904_123000_public_locale_cleanup',
  },
  {
    up: migration_20260904_124000_partner_translation_versions.up,
    down: migration_20260904_124000_partner_translation_versions.down,
    name: '20260904_124000_partner_translation_versions',
  },
  {
    up: migration_20260904_125000_site_logo_alt_cleanup.up,
    down: migration_20260904_125000_site_logo_alt_cleanup.down,
    name: '20260904_125000_site_logo_alt_cleanup',
  },
  {
    up: migration_20260904_130000_testimonial_company_locales.up,
    down: migration_20260904_130000_testimonial_company_locales.down,
    name: '20260904_130000_testimonial_company_locales',
  },
  {
    up: migration_20260904_140000_key_figures_translation_cleanup.up,
    down: migration_20260904_140000_key_figures_translation_cleanup.down,
    name: '20260904_140000_key_figures_translation_cleanup',
  },
  {
    up: migration_20260904_150000_key_figures_visibility.up,
    down: migration_20260904_150000_key_figures_visibility.down,
    name: '20260904_150000_key_figures_visibility',
  },
  {
    up: migration_20260904_170000_contact_phone_map.up,
    down: migration_20260904_170000_contact_phone_map.down,
    name: '20260904_170000_contact_phone_map',
  },
  {
    up: migration_20260905_175951_homepage_video_hero.up,
    down: migration_20260905_175951_homepage_video_hero.down,
    name: '20260905_175951_homepage_video_hero',
  },
  {
    up: migration_20260905_181000_fix_homepage_version_visibility.up,
    down: migration_20260905_181000_fix_homepage_version_visibility.down,
    name: '20260905_181000_fix_homepage_version_visibility',
  },
  {
    up: migration_20260906_002217.up,
    down: migration_20260906_002217.down,
    name: '20260906_002217'
  },
  {
    up: migration_20260907_090000_audit_traceability.up,
    down: migration_20260907_090000_audit_traceability.down,
    name: '20260907_090000_audit_traceability',
  },
  {
    up: migration_20260912_100000_public_media_gate.up,
    down: migration_20260912_100000_public_media_gate.down,
    name: '20260912_100000_public_media_gate',
  },
];
