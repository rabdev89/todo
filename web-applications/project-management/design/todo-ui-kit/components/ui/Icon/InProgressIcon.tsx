import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._In Progress.svg';

export const InProgressIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
