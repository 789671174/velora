// In-memory DB for demo. Replaced with real DB in production.
export type OpeningHours = Record<number, { active: boolean, start: string, end: string }>
export type Settings = {
  businessName: string
  emailFromName: string
  emailFromAddress: string
  smsFrom: string
  slotMinutes: number
  opening: OpeningHours
  holidays: string[] // ISO dates
  logoUrl?: string
}

export type BookingRequest = {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  name: string
  email: string
  phone?: string
  note?: string
  status: 'pending'|'accepted'|'rejected'
  createdAt: string
}

export type Appointment = {
  id: string
  start: string // ISO
  end: string   // ISO
  clientName: string
  clientEmail: string
  clientPhone?: string
  note?: string
}

class DB {
  settings: Settings
  requests: BookingRequest[] = []
  appointments: Appointment[] = []
  constructor(){
    this.settings = {
      businessName: 'Demo Salon',
      emailFromName: 'Demo Salon',
      emailFromAddress: 'demo@salon.example',
      smsFrom: '+41000000000',
      slotMinutes: 15,
      opening: {
        0:{active:false,start:'09:00',end:'17:00'},
        1:{active:true,start:'09:00',end:'18:00'},
        2:{active:true,start:'09:00',end:'18:00'},
        3:{active:true,start:'09:00',end:'18:00'},
        4:{active:true,start:'09:00',end:'18:00'},
        5:{active:true,start:'09:00',end:'18:00'},
        6:{active:true,start:'10:00',end:'14:00'},
      },
      holidays: [],
      logoUrl: undefined,
    }
  }
}

const globalForDB = global as unknown as { __db?: DB }
export const db = globalForDB.__db ?? (globalForDB.__db = new DB())
