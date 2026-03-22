import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Back.svg';

export const BackIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
