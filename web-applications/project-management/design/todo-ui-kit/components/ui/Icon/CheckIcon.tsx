import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Check.svg';

export const CheckIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
