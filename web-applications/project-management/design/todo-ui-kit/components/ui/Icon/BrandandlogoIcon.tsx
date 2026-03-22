import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/._Brand and logo.svg';

export const BrandandlogoIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
