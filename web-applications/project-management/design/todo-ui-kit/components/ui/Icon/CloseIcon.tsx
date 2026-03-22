import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Close.svg';

export const CloseIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
