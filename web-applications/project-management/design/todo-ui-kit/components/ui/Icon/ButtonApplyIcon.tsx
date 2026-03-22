import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Buttons/._Button_Apply.svg';

export const ButtonApplyIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
