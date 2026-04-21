import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Seed subscription plans first
  await knex('subscription_plans').del();
  await knex('subscription_plans').insert([
    {
      name: 'basic',
      name_tamil: 'அடிப்படை',
      price_monthly: 0,
      profile_views_per_month: 10,
      chat_conversations_per_month: 0,
      can_view_astrology: false,
      can_view_photos: false,
      can_view_salary: false,
      can_view_contact: false,
      priority_in_search: false,
      show_badge: false,
      is_active: true,
    },
    {
      name: 'silver',
      name_tamil: 'வெள்ளி',
      price_monthly: 499,
      profile_views_per_month: 50,
      chat_conversations_per_month: 10,
      can_view_astrology: true,
      can_view_photos: true,
      can_view_salary: false,
      can_view_contact: false,
      priority_in_search: false,
      show_badge: true,
      is_active: true,
    },
    {
      name: 'gold',
      name_tamil: 'தங்கம்',
      price_monthly: 999,
      profile_views_per_month: 999,
      chat_conversations_per_month: 50,
      can_view_astrology: true,
      can_view_photos: true,
      can_view_salary: true,
      can_view_contact: true,
      priority_in_search: true,
      show_badge: true,
      is_active: true,
    },
  ]);

  // Platform settings
  await knex('platform_settings').del();
  await knex('platform_settings').insert([
    { key: 'maintenance_mode', value: 'false', description: 'Enable/disable maintenance mode' },
    { key: 'max_photos_per_profile', value: '5', description: 'Maximum photos allowed per profile' },
    { key: 'min_poruthams_default', value: '6', description: 'Default minimum poruthams required' },
  ]);

  // Admin user
  await knex('users').where({ role: 'admin' }).del();
  const hash = await bcrypt.hash('Admin@123', 10);
  await knex('users').insert([
    {
      email: 'admin@mathat.in',
      password_hash: hash,
      role: 'admin',
      is_active: true,
      is_email_verified: true,
    },
  ]);
}
