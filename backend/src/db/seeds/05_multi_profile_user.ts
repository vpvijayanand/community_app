import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

/**
 * Seeds a single parent user who manages two matrimony profiles —
 * one for their son (Groom) and one for their daughter (Bride).
 * Demonstrates the multi-profile-per-user capability.
 */
export async function seed(knex: Knex): Promise<void> {
  const email = 'parent.multi@example.com';

  // Idempotent: delete existing data for this user before re-seeding
  await knex('users').where({ email }).del();

  const hash = await bcrypt.hash('Parent@1234', 10);

  const [user] = await knex('users').insert({
    email,
    password_hash: hash,
    role: 'user',
    is_active: true,
    is_email_verified: true,
  }).returning('id');

  const userId = user.id;

  // Profile 1 — Son (Groom)
  const [groomProfile] = await knex('profiles').insert({
    user_id: userId,
    full_name: 'Arjun Krishnamurthy',
    full_name_tamil: 'அர்ஜுன் கிருஷ்ணமூர்த்தி',
    gender: 'male',
    date_of_birth: '1996-03-14',
    marital_status: 'never_married',
    mother_tongue: 'Tamil',
    religion: 'Hindu',
    height_cm: 175,
    weight_kg: 70,
    complexion: 'fair',
    food_preference: 'vegetarian',
    employment_type: 'Private',
    company_name: 'Zoho Corporation',
    designation: 'Senior Software Engineer',
    work_location: 'Chennai',
    annual_income: 1200000,
    qualification: 'B.E Computer Science',
    field_of_study: 'Computer Science',
    institution: 'Anna University',
    graduation_year: 2018,
    family_type: 'joint',
    family_status: 'middle_class',
    family_values: 'traditional',
    father_name: 'Krishnamurthy R',
    mother_name: 'Padmavathi K',
    state: 'Tamil Nadu',
    city: 'Chennai',
    native_place: 'Thanjavur',
    willing_to_relocate: true,
    wizard_step: 8,
    status: 'approved',
    is_verified: true,
    completeness_score: 95,
  }).returning('id');

  // Profile 2 — Daughter (Bride)
  const [brideProfile] = await knex('profiles').insert({
    user_id: userId,
    full_name: 'Ananya Krishnamurthy',
    full_name_tamil: 'அனன்யா கிருஷ்ணமூர்த்தி',
    gender: 'female',
    date_of_birth: '1998-07-22',
    marital_status: 'never_married',
    mother_tongue: 'Tamil',
    religion: 'Hindu',
    height_cm: 162,
    weight_kg: 55,
    complexion: 'fair',
    food_preference: 'vegetarian',
    employment_type: 'Government',
    company_name: 'Tamil Nadu Government',
    designation: 'Assistant Engineer',
    work_location: 'Coimbatore',
    annual_income: 650000,
    qualification: 'M.E Civil Engineering',
    field_of_study: 'Civil Engineering',
    institution: 'PSG College of Technology',
    graduation_year: 2021,
    family_type: 'joint',
    family_status: 'middle_class',
    family_values: 'traditional',
    father_name: 'Krishnamurthy R',
    mother_name: 'Padmavathi K',
    state: 'Tamil Nadu',
    city: 'Coimbatore',
    native_place: 'Thanjavur',
    willing_to_relocate: true,
    wizard_step: 8,
    status: 'pending',
    is_verified: false,
    completeness_score: 88,
  }).returning('id');

  // Astrology for the Groom
  await knex('astrology_details').insert({
    profile_id: groomProfile.id,
    date_of_birth: '1996-03-14',
    birth_time: '06:30',
    birth_am_pm: 'AM',
    birth_place: 'Thanjavur, Tamil Nadu',
    rasi_name: 'Rishabam',
    natchathiram: 'Rohini',
    padam: 2,
  });

  // Astrology for the Bride
  await knex('astrology_details').insert({
    profile_id: brideProfile.id,
    date_of_birth: '1998-07-22',
    birth_time: '09:45',
    birth_am_pm: 'AM',
    birth_place: 'Thanjavur, Tamil Nadu',
    rasi_name: 'Kadagam',
    natchathiram: 'Punarpoosam',
    padam: 3,
  });

  // Partner expectations for the Groom
  await knex('profile_expectations').insert({
    profile_id: groomProfile.id,
    age_range_min: 22,
    age_range_max: 30,
    height_range_min: 150,
    height_range_max: 170,
    education_pref: 'Graduate and above',
    income_pref: null,
    minimum_poruthams: 6,
  });

  // Partner expectations for the Bride
  await knex('profile_expectations').insert({
    profile_id: brideProfile.id,
    age_range_min: 26,
    age_range_max: 34,
    height_range_min: 165,
    height_range_max: 185,
    education_pref: 'Graduate and above',
    income_pref: 800000,
    minimum_poruthams: 7,
    custom_note: 'Prefer someone working in government or MNC',
  });

  console.log(`✅ Multi-profile user seeded: ${email} (Groom: ${groomProfile.id}, Bride: ${brideProfile.id})`);
}
