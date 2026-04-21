import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // ── users ──────────────────────────────────────────────────────────────────
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('email', 255).unique().notNullable();
    t.string('password_hash', 255);
    t.string('role', 20).notNullable().defaultTo('user');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.boolean('is_email_verified').notNullable().defaultTo(false);
    t.string('language_preference', 10).defaultTo('ta');
    t.timestamp('last_login_at', { useTz: true });
    t.timestamp('last_active_at', { useTz: true });
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── oauth_accounts ─────────────────────────────────────────────────────────
  await knex.schema.createTable('oauth_accounts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('provider', 50).notNullable();
    t.string('provider_account_id', 255).notNullable();
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.unique(['provider', 'provider_account_id']);
  });

  // ── subscription_plans ─────────────────────────────────────────────────────
  await knex.schema.createTable('subscription_plans', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name', 50).unique().notNullable();       // basic, silver, gold
    t.string('name_tamil', 100);
    t.decimal('price_monthly', 10, 2).defaultTo(0);
    t.integer('profile_views_per_month').defaultTo(0);
    t.integer('chat_conversations_per_month').defaultTo(0);
    t.boolean('can_view_astrology').defaultTo(false);
    t.boolean('can_view_photos').defaultTo(false);
    t.boolean('can_view_salary').defaultTo(false);
    t.boolean('can_view_contact').defaultTo(false);
    t.boolean('priority_in_search').defaultTo(false);
    t.boolean('show_badge').defaultTo(false);
    t.boolean('is_active').defaultTo(true);
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── profiles ───────────────────────────────────────────────────────────────
  await knex.schema.createTable('profiles', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').unique().notNullable().references('id').inTable('users').onDelete('CASCADE');

    // Step 1
    t.string('full_name', 255);
    t.string('full_name_tamil', 255);
    t.string('gender', 10);
    t.date('date_of_birth');
    t.string('marital_status', 30);
    t.string('mother_tongue', 50).defaultTo('Tamil');
    t.string('religion', 50).defaultTo('Hindu');

    // Step 2
    t.integer('height_cm');
    t.integer('weight_kg');
    t.string('complexion', 30);
    t.string('food_preference', 30);
    t.string('body_type', 30);
    t.text('physical_disability');

    // Step 3
    t.string('employment_type', 30);
    t.string('company_name', 255);
    t.string('designation', 255);
    t.string('work_location', 255);
    t.integer('annual_income');

    // Step 4
    t.string('qualification', 100);
    t.string('field_of_study', 100);
    t.string('institution', 255);
    t.integer('graduation_year');

    // Step 5
    t.string('family_type', 30);
    t.string('father_name', 255);
    t.string('father_occupation', 255);
    t.boolean('father_alive');
    t.string('mother_name', 255);
    t.string('mother_occupation', 255);
    t.boolean('mother_alive');
    t.string('family_status', 30);
    t.string('family_values', 30);

    // Step 6
    t.string('country', 100).defaultTo('India');
    t.string('state', 100);
    t.string('city', 100);
    t.string('area', 100);
    t.string('native_place', 100);
    t.boolean('willing_to_relocate');

    // Wizard / meta
    t.integer('wizard_step').defaultTo(0);
    t.string('status', 20).defaultTo('draft');  // draft, pending, approved, rejected
    t.boolean('is_verified').defaultTo(false);
    t.integer('completeness_score').defaultTo(0);
    t.integer('view_count').defaultTo(0);

    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── profile_siblings ───────────────────────────────────────────────────────
  await knex.schema.createTable('profile_siblings', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('profile_id').notNullable().references('id').inTable('profiles').onDelete('CASCADE');
    t.string('name', 255);
    t.string('gender', 10);
    t.string('marital_status', 30);
    t.string('occupation', 255);
    t.integer('sort_order').defaultTo(0);
  });

  // ── astrology_details ──────────────────────────────────────────────────────
  await knex.schema.createTable('astrology_details', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('profile_id').unique().notNullable().references('id').inTable('profiles').onDelete('CASCADE');
    t.date('date_of_birth');
    t.string('birth_time', 20);
    t.string('birth_am_pm', 2);
    t.string('birth_place', 255);
    t.decimal('birth_lat', 9, 6);
    t.decimal('birth_lng', 9, 6);
    t.string('lagna_name', 50);
    t.string('rasi_name', 50);
    t.string('natchathiram', 50);
    t.integer('padam');
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── planet_positions ───────────────────────────────────────────────────────
  await knex.schema.createTable('planet_positions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('astrology_id').notNullable().references('id').inTable('astrology_details').onDelete('CASCADE');
    t.string('planet', 30);
    t.string('rasi', 50);
    t.integer('house');
    t.decimal('degree', 6, 3);
  });

  // ── profile_expectations ───────────────────────────────────────────────────
  await knex.schema.createTable('profile_expectations', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('profile_id').unique().notNullable().references('id').inTable('profiles').onDelete('CASCADE');
    t.integer('age_range_min');
    t.integer('age_range_max');
    t.integer('height_range_min');
    t.integer('height_range_max');
    t.specificType('complexion_pref', 'text[]').defaultTo('{}');
    t.specificType('food_pref', 'text[]').defaultTo('{}');
    t.string('education_pref', 100);
    t.specificType('employment_pref', 'text[]').defaultTo('{}');
    t.integer('income_pref');
    t.specificType('location_pref', 'text[]').defaultTo('{}');
    t.integer('minimum_poruthams').defaultTo(6);
    t.text('custom_note');
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── profile_photos ─────────────────────────────────────────────────────────
  await knex.schema.createTable('profile_photos', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('profile_id').notNullable().references('id').inTable('profiles').onDelete('CASCADE');
    t.string('url', 1000).notNullable();
    t.boolean('is_primary').defaultTo(false);
    t.boolean('blur_for_basic').defaultTo(false);
    t.integer('sort_order').defaultTo(0);
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── profile_views ──────────────────────────────────────────────────────────
  await knex.schema.createTable('profile_views', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('viewer_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('viewed_profile_id').notNullable().references('id').inTable('profiles').onDelete('CASCADE');
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── user_subscriptions ─────────────────────────────────────────────────────
  await knex.schema.createTable('user_subscriptions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('plan_id').notNullable().references('id').inTable('subscription_plans');
    t.string('tier', 20).notNullable();
    t.string('status', 20).defaultTo('active');
    t.timestamp('start_date', { useTz: true });
    t.timestamp('end_date', { useTz: true });
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── payments ───────────────────────────────────────────────────────────────
  await knex.schema.createTable('payments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('subscription_id').references('id').inTable('user_subscriptions');
    t.decimal('amount', 10, 2);
    t.string('gateway_payment_id', 255);
    t.string('status', 20).defaultTo('pending');
    t.timestamp('paid_at', { useTz: true });
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── usage_tracking ─────────────────────────────────────────────────────────
  await knex.schema.createTable('usage_tracking', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('month', 7).notNullable();   // YYYY-MM
    t.integer('profile_views').defaultTo(0);
    t.integer('chat_initiations').defaultTo(0);
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    t.unique(['user_id', 'month']);
  });

  // ── interests ──────────────────────────────────────────────────────────────
  await knex.schema.createTable('interests', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('from_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('to_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('status', 20).defaultTo('pending');
    t.text('message');
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.unique(['from_user_id', 'to_user_id']);
  });

  // ── blocks ─────────────────────────────────────────────────────────────────
  await knex.schema.createTable('blocks', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('blocker_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('blocked_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('reason');
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.unique(['blocker_user_id', 'blocked_user_id']);
  });

  // ── reports ────────────────────────────────────────────────────────────────
  await knex.schema.createTable('reports', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('reporter_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('reported_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('reason', 50);
    t.text('description');
    t.string('status', 20).defaultTo('open');
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── conversations ──────────────────────────────────────────────────────────
  await knex.schema.createTable('conversations', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('participant_1_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('participant_2_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.boolean('is_blocked').defaultTo(false);
    t.timestamp('last_message_at', { useTz: true });
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── conversation_participants ───────────────────────────────────────────────
  await knex.schema.createTable('conversation_participants', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('conversation_id').notNullable().references('id').inTable('conversations').onDelete('CASCADE');
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('unread_count').defaultTo(0);
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    t.unique(['conversation_id', 'user_id']);
  });

  // ── messages ───────────────────────────────────────────────────────────────
  await knex.schema.createTable('messages', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('conversation_id').notNullable().references('id').inTable('conversations').onDelete('CASCADE');
    t.uuid('sender_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('text').notNullable();
    t.string('receipt', 20).defaultTo('sent');   // sent, delivered, read
    t.boolean('is_deleted').defaultTo(false);
    t.timestamp('read_at', { useTz: true });
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── compatibility_results ─────────────────────────────────────────────────
  await knex.schema.createTable('compatibility_results', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('profile_id_1').notNullable().references('id').inTable('profiles').onDelete('CASCADE');
    t.uuid('profile_id_2').notNullable().references('id').inTable('profiles').onDelete('CASCADE');
    t.integer('total_score').defaultTo(0);
    t.jsonb('poruthams').defaultTo('[]');
    t.timestamp('calculated_at', { useTz: true }).defaultTo(knex.fn.now());
    t.unique(['profile_id_1', 'profile_id_2']);
  });

  // ── notifications ─────────────────────────────────────────────────────────
  await knex.schema.createTable('notifications', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('type', 50).notNullable();
    t.string('title', 255);
    t.string('title_tamil', 255);
    t.text('message');
    t.text('message_tamil');
    t.boolean('is_read').defaultTo(false);
    t.jsonb('data').defaultTo('{}');
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── news_posts ─────────────────────────────────────────────────────────────
  await knex.schema.createTable('news_posts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('author_id').notNullable().references('id').inTable('users');
    t.string('title', 500).notNullable();
    t.string('title_tamil', 500);
    t.text('content');
    t.text('content_tamil');
    t.text('excerpt');
    t.text('excerpt_tamil');
    t.string('category', 50);
    t.string('image_url', 1000);
    t.specificType('tags', 'text[]').defaultTo('{}');
    t.boolean('is_published').defaultTo(false);
    t.integer('view_count').defaultTo(0);
    t.timestamp('published_at', { useTz: true });
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── learning_articles ──────────────────────────────────────────────────────
  await knex.schema.createTable('learning_articles', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('author_id').notNullable().references('id').inTable('users');
    t.string('title', 500).notNullable();
    t.string('title_tamil', 500);
    t.text('content');
    t.text('content_tamil');
    t.string('category', 100);
    t.string('image_url', 1000);
    t.specificType('tags', 'text[]').defaultTo('{}');
    t.boolean('is_published').defaultTo(false);
    t.timestamp('published_at', { useTz: true });
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── ads ────────────────────────────────────────────────────────────────────
  await knex.schema.createTable('ads', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('created_by').notNullable().references('id').inTable('users');
    t.string('title', 255).notNullable();
    t.string('title_tamil', 255);
    t.text('description');
    t.text('description_tamil');
    t.string('image_url', 1000);
    t.string('link_url', 1000);
    t.string('type', 50);
    t.date('start_date');
    t.date('end_date');
    t.boolean('is_active').defaultTo(true);
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── platform_settings ──────────────────────────────────────────────────────
  await knex.schema.createTable('platform_settings', (t) => {
    t.string('key', 100).primary();
    t.text('value');
    t.string('description', 255);
    t.uuid('updated_by').references('id').inTable('users');
    t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── admin_audit_log ────────────────────────────────────────────────────────
  await knex.schema.createTable('admin_audit_log', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('admin_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('action', 100).notNullable();
    t.string('target_type', 50);
    t.string('target_id', 255);
    t.jsonb('details').defaultTo('{}');
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── Indexes ────────────────────────────────────────────────────────────────
  await knex.raw('CREATE INDEX idx_profiles_status ON profiles(status)');
  await knex.raw('CREATE INDEX idx_profiles_state ON profiles(state)');
  await knex.raw('CREATE INDEX idx_profiles_gender ON profiles(gender)');
  await knex.raw('CREATE INDEX idx_profiles_score ON profiles(completeness_score DESC)');
  await knex.raw('CREATE INDEX idx_astro_rasi ON astrology_details(rasi_name)');
  await knex.raw('CREATE INDEX idx_messages_conv ON messages(conversation_id, created_at)');
  await knex.raw('CREATE INDEX idx_notifications_user ON notifications(user_id, is_read)');
  await knex.raw('CREATE INDEX idx_news_published ON news_posts(is_published, published_at DESC)');
}

export async function down(knex: Knex): Promise<void> {
  const tables = [
    'admin_audit_log', 'platform_settings', 'ads', 'learning_articles',
    'news_posts', 'notifications', 'compatibility_results', 'messages',
    'conversation_participants', 'conversations', 'reports', 'blocks',
    'interests', 'usage_tracking', 'payments', 'user_subscriptions',
    'profile_views', 'profile_photos', 'profile_expectations',
    'planet_positions', 'astrology_details', 'profile_siblings',
    'profiles', 'oauth_accounts', 'subscription_plans', 'users',
  ];
  for (const t of tables) await knex.schema.dropTableIfExists(t);
}
