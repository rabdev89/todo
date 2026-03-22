import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Avatar.svg';

export const AvatarIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
