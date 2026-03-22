import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Not Done.svg';

export const NotDoneIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
