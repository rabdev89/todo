import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Google.svg';

export const GoogleIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
