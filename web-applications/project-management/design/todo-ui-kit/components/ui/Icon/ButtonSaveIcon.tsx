import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Buttons/._Button_Save.svg';

export const ButtonSaveIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
