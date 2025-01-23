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
  start_time: string;
  end_time: string;
  date: string | Date;
  office: boolean;
  status: string;
}
