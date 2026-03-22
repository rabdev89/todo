import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Home.svg';

export const HomeIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
