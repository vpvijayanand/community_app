import { z } from "zod"

const currentYear = new Date().getFullYear()

// ─── Step 1 ───────────────────────────────────────────────────────────────────
export const step1Schema = z.object({
  fullName: z.string().min(2, "பெயர் குறைந்தது 2 எழுத்துகள் இருக்க வேண்டும்"),
  gender: z.enum(["male", "female"], { required_error: "பாலினத்தை தேர்ந்தெடுக்கவும்" }),
  dateOfBirth: z
    .string()
    .min(1, "பிறந்த தேதியை உள்ளிடவும்")
    .refine((v) => {
      const dob = new Date(v)
      const ageDiff = Date.now() - dob.getTime()
      const ageDate = new Date(ageDiff)
      const age = Math.abs(ageDate.getUTCFullYear() - 1970)
      return age >= 18 && age <= 60
    }, "வயது 18 முதல் 60 வரை இருக்க வேண்டும்"),
  maritalStatus: z.string().min(1, "திருமண நிலையைத் தேர்ந்தெடுக்கவும்"),
  motherTongue: z.string().min(1, "தாய்மொழி தேர்ந்தெடுக்கவும்"),
  religion: z.string().min(1, "மதம் தேர்ந்தெடுக்கவும்"),
})
export type Step1Data = z.infer<typeof step1Schema>

// ─── Step 2 ───────────────────────────────────────────────────────────────────
export const step2Schema = z.object({
  height: z.number().min(140, "உயரம் குறைந்தது 140 செ.மீ இருக்க வேண்டும்").max(200, "உயரம் 200 செ.மீ-க்கு அதிகமாக இருக்க முடியாது"),
  weight: z.number().min(30, "எடை குறைந்தது 30 கி.கி இருக்க வேண்டும்").max(150, "எடை 150 கி.கி-க்கு அதிகமாக இருக்க முடியாது"),
  complexion: z.string().min(1, "நிறத்தை தேர்ந்தெடுக்கவும்"),
  foodPreference: z.string().min(1, "உணவு விருப்பத்தை தேர்ந்தெடுக்கவும்"),
  bodyType: z.string().min(1, "உடல் வகையை தேர்ந்தெடுக்கவும்"),
  physicalDisability: z.string().optional(),
})
export type Step2Data = z.infer<typeof step2Schema>

// ─── Step 3 ───────────────────────────────────────────────────────────────────
export const step3Schema = z.object({
  employmentType: z.string().min(1, "வேலைவாய்ப்பு வகையை தேர்ந்தெடுக்கவும்"),
  companyName: z.string().optional(),
  designation: z.string().optional(),
  workLocation: z.string().optional(),
  annualIncome: z.string().min(1, "வருடாந்திர வருமானத்தை தேர்ந்தெடுக்கவும்"),
})
export type Step3Data = z.infer<typeof step3Schema>

// ─── Step 4 ───────────────────────────────────────────────────────────────────
export const step4Schema = z.object({
  qualification: z.string().min(1, "கல்வி தகுதியை தேர்ந்தெடுக்கவும்"),
  fieldOfStudy: z.string().min(1, "படிப்பு துறையை உள்ளிடவும்"),
  institution: z.string().min(1, "கல்வி நிறுவனத்தை உள்ளிடவும்"),
  graduationYear: z
    .number()
    .min(1970, "முடித்த ஆண்டு 1970-க்கு பிறகு இருக்க வேண்டும்")
    .max(currentYear, `முடித்த ஆண்டு ${currentYear}-க்கு அதிகமாக இருக்க முடியாது`),
})
export type Step4Data = z.infer<typeof step4Schema>

// ─── Step 5 ───────────────────────────────────────────────────────────────────
const siblingSchema = z.object({
  name: z.string().min(1, "சகோதரர்/சகோதரி பெயர் உள்ளிடவும்"),
  gender: z.string().min(1, "பாலினம் தேர்ந்தெடுக்கவும்"),
  maritalStatus: z.string().min(1, "திருமண நிலை தேர்ந்தெடுக்கவும்"),
  occupation: z.string().optional(),
})

export const step5Schema = z.object({
  familyType: z.string().min(1, "குடும்ப வகையை தேர்ந்தெடுக்கவும்"),
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherAlive: z.boolean().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherAlive: z.boolean().optional(),
  siblings: z.array(siblingSchema).optional(),
  familyStatus: z.string().min(1, "குடும்ப நிலையை தேர்ந்தெடுக்கவும்"),
  familyValues: z.string().min(1, "குடும்ப மதிப்புகளை தேர்ந்தெடுக்கவும்"),
})
export type Step5Data = z.infer<typeof step5Schema>

// ─── Step 6 ───────────────────────────────────────────────────────────────────
export const step6Schema = z.object({
  country: z.string().min(1, "நாட்டை தேர்ந்தெடுக்கவும்"),
  state: z.string().min(1, "மாநிலத்தை தேர்ந்தெடுக்கவும்"),
  city: z.string().min(1, "நகரத்தை உள்ளிடவும்"),
  area: z.string().optional(),
  nativePlace: z.string().optional(),
  willingToRelocate: z.string().min(1, "இடம் மாற விருப்பத்தேர்வை தேர்ந்தெடுக்கவும்"),
})
export type Step6Data = z.infer<typeof step6Schema>

// ─── Step 7 ───────────────────────────────────────────────────────────────────
export const step7Schema = z.object({
  exactBirthTime: z.string().optional(),
  birthAmPm: z.enum(["AM", "PM"]).optional(),
  birthPlace: z.string().optional(),
})
export type Step7Data = z.infer<typeof step7Schema>

// ─── Step 8 ───────────────────────────────────────────────────────────────────
export const step8Schema = z.object({
  ageRangeMin: z.number().min(18).max(60),
  ageRangeMax: z.number().min(18).max(60),
  heightRangeMin: z.number().min(140).max(200),
  heightRangeMax: z.number().min(140).max(200),
  complexionPref: z.array(z.string()).optional(),
  foodPref: z.array(z.string()).optional(),
  educationPref: z.string().optional(),
  employmentPref: z.array(z.string()).optional(),
  incomePref: z.string().optional(),
  locationPref: z.array(z.string()).optional(),
  minimumPoruthams: z.number().min(1).max(10),
  customNote: z.string().max(500, "குறிப்பு 500 எழுத்துகளுக்கு அதிகமாக இருக்க முடியாது").optional(),
})
export type Step8Data = z.infer<typeof step8Schema>

export const STEP_SCHEMAS = [
  step1Schema, step2Schema, step3Schema, step4Schema,
  step5Schema, step6Schema, step7Schema, step8Schema
]
