import * as Tabs from '@radix-ui/react-tabs';
import clsx from 'clsx';
import styles from './Tabs.module.css';

export function Root(props: Tabs.TabsProps & React.RefAttributes<HTMLDivElement>) {
    return <Tabs.Root {...props} />;
}

export function List(props: Tabs.TabsListProps & React.RefAttributes<HTMLDivElement>) {
    return <Tabs.List className={clsx(props.className, styles.tabsList)} {...props} />;
}

export function Trigger(props: Tabs.TabsTriggerProps & React.RefAttributes<HTMLButtonElement>) {
    return <Tabs.Trigger className={clsx(props.className, styles.tabsButton)} {...props} />;
}

export function Content(props: Tabs.TabsContentProps & React.RefAttributes<HTMLDivElement>) {
    return <Tabs.Content {...props} />;
}