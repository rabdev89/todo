import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/._Wallpaper.svg';

export const WallpaperIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
