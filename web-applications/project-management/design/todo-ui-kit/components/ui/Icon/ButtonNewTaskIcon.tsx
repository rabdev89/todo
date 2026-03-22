import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Buttons/._Button_New Task.svg';

export const ButtonNewTaskIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
