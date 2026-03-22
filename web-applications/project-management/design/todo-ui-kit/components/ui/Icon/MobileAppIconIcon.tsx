import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/._Mobile App Icon.svg';

export const MobileAppIconIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
