import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Badge_card.svg';

export const BadgecardIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
