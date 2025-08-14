import { Component, OnInit } from '@angular/core';
import { UserActivity } from '../../interfaces/user-activity.interface';
import { UserActivityService } from '../../services/user-activity.service';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss']
})
export class UserActivityComponent implements OnInit {
  activities: UserActivity[] = [];
  loading: boolean = false;

  constructor(private userActivityService: UserActivityService) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading = true;
    // This would normally call a service method
    // For now, using mock data
    this.activities = [
      {
        id: 1,
        userId: 1,
        action: 'Login',
        timestamp: new Date(),
        details: 'User logged in successfully',
        ipAddress: '192.168.1.1'
      }
    ];
    this.loading = false;
  }
}
