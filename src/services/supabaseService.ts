// Re-export all services for backwards compatibility
export * from './profileService';
export * from './medicationService';
export * from './reminderService';
export * from './qrCodeService';
export * from './doctorSessionService';
export * from './accessLogService';

// Keep the main exports for easy importing
export type {
  Profile,
} from './profileService';

export type {
  Medication,
} from './medicationService';

export type {
  QRCode,
} from './qrCodeService';

export type {
  DoctorAccessSession,
} from './doctorSessionService';

export type {
  AccessLog,
} from './accessLogService';

export type {
  ReminderDB,
  ReminderForm,
  ReminderInput,
} from '@/types/reminder';
