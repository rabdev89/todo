import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Signout.svg';

export const SignoutIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
