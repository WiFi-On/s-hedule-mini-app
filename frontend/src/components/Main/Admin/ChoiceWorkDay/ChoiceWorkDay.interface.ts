export default interface workDayProps {
  id: number;
  start_time: string;
  end_time: string;
  office: boolean;
  status: string;
  user: user;
  isEditable: boolean;
}

interface user {
  telegram_id: number;
  admin: boolean;
  first_name: string;
  last_name: string;
  middle_name: string | null;
}
