// Mock user data for Admin Users management.
// Replace with real API calls in production.

import type { Chart, RasiKey } from "./astrology-data"

export type UserRole = "admin" | "groom" | "bride" | "normal"
export type UserPlan = "basic" | "silver" | "gold" | "platinum"
export type UserStatus = "active" | "pending" | "banned"

export type AdminUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  plan: UserPlan
  status: UserStatus
  joinedAt: string // ISO date
  lastActiveAt?: string

  // Profile
  gender?: "male" | "female"
  dateOfBirth?: string
  maritalStatus?: string
  motherTongue?: string
  religion?: string

  // Physical
  height?: number
  weight?: number
  complexion?: string
  foodPreference?: string
  bodyType?: string
  physicalDisability?: string

  // Career
  employmentType?: string
  companyName?: string
  designation?: string
  workLocation?: string
  annualIncome?: string

  // Education
  qualification?: string
  fieldOfStudy?: string
  institution?: string
  graduationYear?: number

  // Family
  familyType?: string
  fatherName?: string
  fatherOccupation?: string
  fatherAlive?: boolean
  motherName?: string
  motherOccupation?: string
  motherAlive?: boolean
  familyStatus?: string
  familyValues?: string
  siblings?: Array<{ name: string; gender: string; maritalStatus: string; occupation: string }>

  // Location
  country?: string
  state?: string
  city?: string
  area?: string
  nativePlace?: string
  willingToRelocate?: string

  // Astrology
  exactBirthTime?: string
  birthPlace?: string
  lagnaRasi?: RasiKey
  moonRasi?: RasiKey
  natchathiram?: string
  padam?: string
  rasiChart?: Chart
  navamsaChart?: Chart

  // Expectations
  ageRangeMin?: number
  ageRangeMax?: number
  heightRangeMin?: number
  heightRangeMax?: number
  minimumPoruthams?: number

  // Photos
  photos?: Array<{ id: string; url: string; isPrimary: boolean; blurForBasic: boolean }>
}

export const MOCK_USERS: AdminUser[] = [
  {
    id: "u001",
    firstName: "Arun",
    lastName: "Velan",
    email: "arun.velan@example.com",
    phone: "+91 98765 43210",
    role: "groom",
    plan: "gold",
    status: "active",
    joinedAt: "2026-01-14",
    lastActiveAt: "2026-04-18",
    gender: "male",
    dateOfBirth: "1996-08-14",
    maritalStatus: "never_married",
    motherTongue: "Tamil",
    religion: "Hindu",
    height: 174,
    weight: 72,
    complexion: "wheatish",
    foodPreference: "vegetarian",
    bodyType: "Athletic",
    employmentType: "Salaried",
    companyName: "TCS",
    designation: "Senior Engineer",
    workLocation: "Chennai",
    annualIncome: "10-20L",
    qualification: "post_graduate",
    fieldOfStudy: "Computer Science",
    institution: "Anna University",
    graduationYear: 2019,
    familyType: "joint",
    familyValues: "moderate",
    familyStatus: "middle_class",
    fatherName: "Velan",
    fatherOccupation: "Retired Govt Officer",
    fatherAlive: true,
    motherName: "Lakshmi",
    motherOccupation: "Homemaker",
    motherAlive: true,
    country: "India",
    state: "Tamil Nadu",
    city: "Madurai",
    nativePlace: "Madurai",
    willingToRelocate: "open",
    exactBirthTime: "06:42",
    birthPlace: "Madurai",
    lagnaRasi: "Simmam",
    moonRasi: "Meenam",
    natchathiram: "உத்திரட்டாதி",
    padam: "2ம் பாதம்",
    rasiChart: {
      Meenam: ["Mo", "Ke"],
      Mesham: ["Su", "Ve"],
      Rishabam: ["Me"],
      Kadagam: ["Ju"],
      Simmam: ["La"],
      Kanni: ["Ra"],
      Dhanusu: ["Ma", "Sa"],
    },
    navamsaChart: {
      Mesham: ["Ma"],
      Mithunam: ["Me", "Ke"],
      Simmam: ["Su"],
      Thulam: ["Ve", "La"],
      Viruchigam: ["Mo"],
      Magaram: ["Sa"],
      Kumbam: ["Ra"],
      Meenam: ["Ju"],
    },
    ageRangeMin: 22,
    ageRangeMax: 28,
    minimumPoruthams: 6,
  },
  {
    id: "u002",
    firstName: "Meera",
    lastName: "Iyer",
    email: "meera.iyer@example.com",
    phone: "+91 87654 32109",
    role: "bride",
    plan: "gold",
    status: "active",
    joinedAt: "2026-02-03",
    lastActiveAt: "2026-04-19",
    gender: "female",
    dateOfBirth: "1999-03-02",
    maritalStatus: "never_married",
    motherTongue: "Tamil",
    religion: "Hindu",
    height: 162,
    weight: 55,
    complexion: "fair",
    foodPreference: "vegetarian",
    bodyType: "Slim",
    employmentType: "Salaried",
    companyName: "Infosys",
    designation: "Software Analyst",
    workLocation: "Bangalore",
    annualIncome: "5-10L",
    qualification: "graduate",
    fieldOfStudy: "Information Technology",
    institution: "Sastra University",
    graduationYear: 2021,
    familyType: "nuclear",
    familyValues: "moderate",
    familyStatus: "middle_class",
    country: "India",
    state: "Tamil Nadu",
    city: "Thanjavur",
    nativePlace: "Thanjavur",
    willingToRelocate: "yes",
    exactBirthTime: "19:18",
    birthPlace: "Thanjavur",
    lagnaRasi: "Kanni",
    moonRasi: "Rishabam",
    natchathiram: "ரோகிணி",
    padam: "4ம் பாதம்",
    rasiChart: {
      Mesham: ["Ke"],
      Rishabam: ["Mo", "Ju"],
      Mithunam: ["Su", "Me"],
      Kadagam: ["Ve"],
      Simmam: ["Ma"],
      Kanni: ["La"],
      Thulam: ["Sa"],
      Viruchigam: ["Ra"],
    },
    navamsaChart: {
      Mesham: ["Ju"],
      Rishabam: ["Ve", "La"],
      Kadagam: ["Mo"],
      Simmam: ["Su", "Me"],
      Thulam: ["Sa"],
      Viruchigam: ["Ke"],
      Dhanusu: ["Ma"],
      Kumbam: ["Ra"],
    },
    ageRangeMin: 25,
    ageRangeMax: 33,
    minimumPoruthams: 7,
  },
  {
    id: "u003",
    firstName: "Karthik",
    lastName: "Sundaram",
    email: "karthik.s@example.com",
    role: "groom",
    plan: "silver",
    status: "active",
    joinedAt: "2026-03-10",
    gender: "male",
    dateOfBirth: "1994-12-21",
    maritalStatus: "divorced",
    motherTongue: "Tamil",
    religion: "Hindu",
    height: 178,
    employmentType: "Business",
    annualIncome: "20-50L",
    qualification: "graduate",
    country: "India",
    state: "Tamil Nadu",
    city: "Coimbatore",
    rasiChart: { Kumbam: ["La", "Su"], Mesham: ["Mo", "Ke"], Simmam: ["Ju"], Viruchigam: ["Ma"], Meenam: ["Ra", "Ve", "Sa"] },
    navamsaChart: { Mesham: ["La"], Rishabam: ["Mo"], Mithunam: ["Ju"], Kanni: ["Su", "Me"], Dhanusu: ["Sa"], Meenam: ["Ve", "Ra", "Ke", "Ma"] },
  },
  {
    id: "u004",
    firstName: "Priya",
    lastName: "Narayanan",
    email: "priya.n@example.com",
    role: "bride",
    plan: "basic",
    status: "pending",
    joinedAt: "2026-04-01",
    gender: "female",
    dateOfBirth: "2001-07-15",
    maritalStatus: "never_married",
    motherTongue: "Tamil",
    religion: "Hindu",
    height: 158,
    employmentType: "Student",
    country: "India",
    state: "Tamil Nadu",
    city: "Chennai",
  },
  {
    id: "u005",
    firstName: "Ramesh",
    lastName: "Kumar",
    email: "ramesh.k@example.com",
    role: "groom",
    plan: "platinum",
    status: "active",
    joinedAt: "2025-11-20",
    lastActiveAt: "2026-04-17",
    gender: "male",
    dateOfBirth: "1991-04-05",
    maritalStatus: "widowed",
    motherTongue: "Tamil",
    religion: "Hindu",
    height: 180,
    weight: 82,
    employmentType: "Salaried",
    annualIncome: ">50L",
    designation: "Engineering Manager",
    workLocation: "USA",
    country: "USA",
    state: "California",
    city: "San Jose",
    willingToRelocate: "no",
  },
  {
    id: "u006",
    firstName: "Admin",
    lastName: "User",
    email: "admin@mathat.in",
    role: "admin",
    plan: "platinum",
    status: "active",
    joinedAt: "2025-06-01",
    lastActiveAt: "2026-04-19",
  },
  {
    id: "u007",
    firstName: "Divya",
    lastName: "Krishnamurthy",
    email: "divya.k@example.com",
    role: "bride",
    plan: "gold",
    status: "banned",
    joinedAt: "2026-01-25",
    gender: "female",
    dateOfBirth: "1998-09-10",
    maritalStatus: "never_married",
    motherTongue: "Tamil",
    religion: "Hindu",
    height: 165,
    city: "Salem",
    state: "Tamil Nadu",
    country: "India",
  },
  {
    id: "u008",
    firstName: "Suresh",
    lastName: "Pandi",
    email: "suresh.p@example.com",
    role: "groom",
    plan: "silver",
    status: "active",
    joinedAt: "2026-02-14",
    gender: "male",
    dateOfBirth: "1993-03-30",
    maritalStatus: "never_married",
    height: 172,
    city: "Trichy",
    state: "Tamil Nadu",
    country: "India",
  },
]
