import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Bullet.svg';

export const BulletIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
