import * as RadixTooltip from '@radix-ui/react-tooltip';
import styles from './Tooltip.module.css';

export default function Tooltip({
    content,
    children,
    placement,
    disabled,
    delay = 0,
}: {
    content: React.ReactNode;
    children: React.ReactElement;
    placement?: 'bottom' | 'top';
    disabled?: boolean;
    delay?: number;
}) {
    if (disabled) {
        return children;
    }
    return (
        // eslint-disable-next-line @eslint-react/no-context-provider
        <RadixTooltip.Provider delayDuration={delay} disableHoverableContent>
            <RadixTooltip.Root>
                <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
                <RadixTooltip.Portal>
                    <RadixTooltip.Content
                        hideWhenDetached
                        className={styles.tooltip}
                        side={placement}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        {content}
                        <RadixTooltip.Arrow className={styles.arrow} />
                    </RadixTooltip.Content>
                </RadixTooltip.Portal>
            </RadixTooltip.Root>
        </RadixTooltip.Provider>
    );
}
