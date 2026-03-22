import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/._Logo Header.svg';

export const LogoHeaderIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
