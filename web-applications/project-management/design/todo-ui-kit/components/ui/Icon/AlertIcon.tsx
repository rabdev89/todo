import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Alert.svg';

export const AlertIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
