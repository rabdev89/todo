import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Meatball.svg';

export const MeatballIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
