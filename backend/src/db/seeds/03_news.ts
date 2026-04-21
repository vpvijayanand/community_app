import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('news_posts').del();

  const adminUser = await knex('users').where({ role: 'admin' }).first();
  if (!adminUser) return;

  await knex('news_posts').insert([
    {
      author_id: adminUser.id,
      title: 'Matrimony Info Center Opening',
      title_tamil: 'திருமண தகவல் மையம் திறப்பு',
      content: 'A new matrimony info center has been opened. Everyone is welcome to benefit.',
      content_tamil: 'புதிய திருமண தகவல் மையம் திறக்கப்பட்டுள்ளது. அனைவரும் பயன்பெறவும்.',
      excerpt: 'New matrimony info center opened.',
      excerpt_tamil: 'புதிய திருமண மையம் திறப்பு.',
      category: 'events',
      tags: ['matrimony', 'events'],
      is_published: true,
      published_at: knex.fn.now(),
    },
    {
      author_id: adminUser.id,
      title: 'Special Matrimony Camp This Sunday',
      title_tamil: 'ஞாயிறு திருமண சிறப்பு முகாம்',
      content: 'A special matrimony camp will be held this Sunday. All eligible candidates are invited.',
      content_tamil: 'வருகின்ற ஞாயிறு அன்று திருமண சிறப்பு முகாம் நடைபெறும். தகுதியானவர்கள் அனைவரும் அழைக்கப்படுகின்றனர்.',
      excerpt: 'Special camp this Sunday.',
      excerpt_tamil: 'ஞாயிறு சிறப்பு முகாம்.',
      category: 'updates',
      tags: ['camp', 'updates'],
      is_published: true,
      published_at: knex.fn.now(),
    },
  ]);
}
