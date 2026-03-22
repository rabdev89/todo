import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._attachment.svg';

export const AttachmentIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
