import { IconRegistry, IconName } from './registry';

export const AppIcon = ({ name, ...props }: { name: IconName } & any) => {
  const IconComp = IconRegistry[name];
  if (!IconComp) return null;
  return <IconComp {...props} />;
};
