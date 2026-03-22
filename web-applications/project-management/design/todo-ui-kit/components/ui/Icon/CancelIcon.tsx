import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Cancel.svg';

export const CancelIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
