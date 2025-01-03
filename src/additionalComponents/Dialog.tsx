import * as RadixDialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import styles from './Dialog.module.css';

export function Root(
    props: RadixDialog.DialogProps & React.RefAttributes<HTMLDivElement>,
) {
    return <RadixDialog.Root {...props} />;
}

export function Portal(
    props: RadixDialog.DialogPortalProps & React.RefAttributes<HTMLDivElement>,
) {
    return <RadixDialog.Portal {...props} />;
}

export function Overlay(
    props: RadixDialog.DialogOverlayProps & React.RefAttributes<HTMLDivElement>,
) {
    const { className, ...rest } = props;
    return (
        <RadixDialog.Overlay
            className={clsx(className, styles.overlay)}
            {...rest}
        />
    );
}

export function Content(
    props: RadixDialog.DialogContentProps &
        React.RefAttributes<HTMLDivElement> & { narrow?: boolean },
) {
    const { narrow, className, ...rest } = props;
    return (
        <RadixDialog.Content
            aria-describedby={undefined}
            className={clsx(className, styles.content, {
                [styles.narrow]: narrow,
            })}
            {...rest}
        />
    );
}

export function Title(
    props: RadixDialog.DialogTitleProps & React.RefAttributes<HTMLDivElement>,
) {
    return <RadixDialog.Title {...props} />;
}

export function Footer({ children }: { children: React.ReactNode }) {
    return <div className={styles.footer}>{children}</div>;
}

export function Close(
    props: RadixDialog.DialogCloseProps &
        React.RefAttributes<HTMLButtonElement>,
) {
    return <RadixDialog.Close {...props} />;
}

export function Dialog({
    open,
    onOpenChange,
    title,
    wide,
    className,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    wide?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <Root open={open} onOpenChange={onOpenChange}>
            <Portal>
                <Overlay />
                <Content narrow={!wide}>
                    <Title>{title}</Title>
                    <div className={className}>{children}</div>
                    <Footer>
                        <Close className="tracker-button">Close</Close>
                    </Footer>
                </Content>
            </Portal>
        </Root>
    );
}
