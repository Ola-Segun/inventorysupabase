export interface UserActivity {
  id?: number;
  userId: number;
  action: string;
  timestamp: Date;
  details: string;
  ipAddress?: string;
}
