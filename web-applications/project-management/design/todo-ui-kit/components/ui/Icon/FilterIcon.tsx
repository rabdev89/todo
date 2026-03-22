import { SvgIcon } from '@mui/material';
import { ReactComponent as Svg } from '../../assets/__MACOSX/Dev Case Study Assets/Icons/._Filter.svg';

export const FilterIcon = (props:any) => (
  <SvgIcon component={Svg} inheritViewBox {...props} />
);
