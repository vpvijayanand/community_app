import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('ads').del();

  const adminUser = await knex('users').where({ role: 'admin' }).first();
  if (!adminUser) return;

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  await knex('ads').insert([
    {
      created_by: adminUser.id,
      title: 'Wedding Invitation Printing',
      title_tamil: 'திருமண அழைப்பிதழ் அச்சிடல்',
      description: 'Get top quality wedding invitations printed at best prices.',
      description_tamil: 'சிறந்த தரத்தில் திருமண அழைப்பிதழ்கள் அச்சிடுங்கள்.',
      image_url: null,
      link_url: null,
      type: 'business',
      start_date: now.toISOString().split('T')[0],
      end_date: nextMonth.toISOString().split('T')[0],
      is_active: true,
    },
    {
      created_by: adminUser.id,
      title: 'Pongal Special Community Event',
      title_tamil: 'பொங்கல் சிறப்பு சமுதாய விழா',
      description: 'Join us for a massive community Pongal celebration.',
      description_tamil: 'பொங்கல் சிறப்பு சமுதாய விழாவில் கலந்துகொள்ளுங்கள்.',
      image_url: null,
      link_url: null,
      type: 'event',
      start_date: now.toISOString().split('T')[0],
      end_date: nextMonth.toISOString().split('T')[0],
      is_active: true,
    },
  ]);
}
