import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clear dependent tables first
  await knex('profile_siblings').del();
  await knex('astrology_details').del();
  await knex('profile_expectations').del();
  await knex('profile_photos').del();
  await knex('profiles').del();
  await knex('users').whereNot({ role: 'admin' }).del();

  const hash = await bcrypt.hash('User@1234', 10);

  const names = [
    'Murugan K', 'Kavitha S', 'Senthil R', 'Priya M',
    'Karthik V', 'Lakshmi N', 'Ramesh T', 'Anitha P',
    'Vijay B',  'Divya C',
  ];
  const genders: Array<'male' | 'female'> = [
    'male', 'female', 'male', 'female',
    'male', 'female', 'male', 'female',
    'male', 'female',
  ];
  const rasis = ['Mesham', 'Rishabam', 'Midhunam', 'Kadagam', 'Simmam', 'Kanni', 'Thulam', 'Viruchigam', 'Dhanusu', 'Magaram'];
  const natchathirams = ['Aswini', 'Karthigai', 'Rohini', 'Mirugaseerisham', 'Thiruvadhirai', 'Punarpoosam', 'Poosam', 'Ayilyam', 'Magam', 'Pooram'];
  const subs = ['basic', 'silver', 'gold', 'basic', 'silver', 'gold', 'basic', 'silver', 'gold', 'basic'];

  // Insert users
  const userRows = names.map((name, i) => ({
    email: `user${i + 1}@example.com`,
    password_hash: hash,
    role: 'user',
    is_active: true,
    is_email_verified: true,
  }));
  const insertedUsers = await knex('users').insert(userRows).returning('id');

  // Get subscription plan ids
  const plans: Record<string, string> = {};
  const planRows = await knex('subscription_plans').select('id', 'name');
  planRows.forEach((p: any) => { plans[p.name] = p.id; });

  // Insert profiles
  const profileRows = insertedUsers.map((u: any, i: number) => ({
    user_id: u.id,
    full_name: names[i],
    gender: genders[i],
    date_of_birth: `199${i % 9}-06-${(i + 10).toString().padStart(2, '0')}`,
    marital_status: 'never_married',
    mother_tongue: 'Tamil',
    religion: 'Hindu',
    height_cm: 158 + i * 2,
    weight_kg: 55 + i,
    complexion: i % 2 === 0 ? 'fair' : 'wheatish',
    food_preference: 'vegetarian',
    employment_type: i % 3 === 0 ? 'Government' : 'Private',
    company_name: 'Tech Solutions Ltd',
    designation: 'Software Engineer',
    work_location: 'Chennai',
    annual_income: 400000 + i * 50000,
    qualification: 'B.E Computer Science',
    field_of_study: 'Computer Science',
    institution: 'Anna University',
    graduation_year: 2015 + (i % 5),
    family_type: i % 2 === 0 ? 'nuclear' : 'joint',
    family_status: 'middle_class',
    family_values: 'traditional',
    state: 'Tamil Nadu',
    city: i % 2 === 0 ? 'Chennai' : 'Coimbatore',
    native_place: 'Tamil Nadu',
    willing_to_relocate: i % 2 === 0,
    wizard_step: 8,
    status: 'approved',
    is_verified: true,
    completeness_score: 85 + i,
  }));
  const insertedProfiles = await knex('profiles').insert(profileRows).returning('id');

  // Insert astrology details
  const astroRows = insertedProfiles.map((p: any, i: number) => ({
    profile_id: p.id,
    date_of_birth: `199${i % 9}-06-${(i + 10).toString().padStart(2, '0')}`,
    birth_time: `0${(i % 12) + 1}:00`,
    birth_am_pm: i % 2 === 0 ? 'AM' : 'PM',
    birth_place: 'Chennai, Tamil Nadu',
    rasi_name: rasis[i],
    natchathiram: natchathirams[i],
    padam: (i % 4) + 1,
  }));
  await knex('astrology_details').insert(astroRows);

  // Insert subscriptions for non-basic users
  for (let i = 0; i < insertedUsers.length; i++) {
    const tier = subs[i];
    if (tier !== 'basic' && plans[tier]) {
      await knex('user_subscriptions').insert({
        user_id: insertedUsers[i].id,
        plan_id: plans[tier],
        tier,
        status: 'active',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
  }
}
