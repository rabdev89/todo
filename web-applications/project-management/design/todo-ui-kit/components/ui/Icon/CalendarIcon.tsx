import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Calendar.svg';

export const CalendarIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
