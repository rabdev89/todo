import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Done.svg';

export const DoneIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
