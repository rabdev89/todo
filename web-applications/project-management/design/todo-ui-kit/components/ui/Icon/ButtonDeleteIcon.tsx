import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Buttons/._Button_Delete.svg';

export const ButtonDeleteIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
