export class WalkSettingsDto {
  enabled: boolean;
  startHour: number;
  endHour: number;
  stepsGoal: number;
  activeMinutesGoal: number;
}

export class WaterSettingsDto {
  enabled: boolean;
  intervalMinutes: number;
}

export class UpdateNotificationSettingsDto {
  walk: WalkSettingsDto;
  water: WaterSettingsDto;
}
