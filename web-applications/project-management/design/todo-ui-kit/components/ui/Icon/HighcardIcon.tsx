import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._High_card.svg';

export const HighcardIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
