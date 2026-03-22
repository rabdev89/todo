import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Cancelled.svg';

export const CancelledIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
