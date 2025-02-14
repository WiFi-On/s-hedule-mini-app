export interface MainPropsI {
  initDate: string;
}

export interface ParamsGetScheduleI {
  initData: string;
  startDate?: string;
  endDate?: string;
  office?: boolean;
  status?: string;
}

export interface ScheduleI {
  id: number;
  user: User;
  start_time: string;
  end_time: string;
  date: string | Date;
  office: boolean;
  status: string;
}

interface User {
  telegram_id: number;
  admin: boolean;
  first_name: string;
  last_name: string;
  middle_name: string | null;
}
