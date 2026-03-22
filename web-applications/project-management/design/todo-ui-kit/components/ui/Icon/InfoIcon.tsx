import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Info.svg';

export const InfoIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
