import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserActivity } from '../interfaces/user-activity.interface';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  constructor() {}

  // Mock method - replace with actual API call later
  getActivities(): Observable<UserActivity[]> {
    const mockData: UserActivity[] = [
      {
        id: 1,
        userId: 1,
        action: 'Login',
        timestamp: new Date(),
        details: 'User logged in successfully',
        ipAddress: '192.168.1.1'
      }
    ];
    return of(mockData);
  }
}
