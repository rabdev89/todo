import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._High_table.svg';

export const HightableIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
