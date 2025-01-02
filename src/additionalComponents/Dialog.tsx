import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import styles from './Dialog.module.css';

export function Root(
    props: Dialog.DialogProps & React.RefAttributes<HTMLDivElement>,
) {
    return <Dialog.Root {...props} />;
}

export function Portal(
    props: Dialog.DialogPortalProps & React.RefAttributes<HTMLDivElement>,
) {
    return <Dialog.Portal {...props} />;
}

export function Overlay(
    props: Dialog.DialogOverlayProps & React.RefAttributes<HTMLDivElement>,
) {
    const { className, ...rest } = props;
    return (
        <Dialog.Overlay
            className={clsx(className, styles.overlay)}
            {...rest}
        />
    );
}

export function Content(
    props: Dialog.DialogContentProps &
        React.RefAttributes<HTMLDivElement> & { narrow?: boolean },
) {
    const { narrow, className, ...rest } = props;
    return (
        <Dialog.Content
            aria-describedby={undefined}
            className={clsx(className, styles.content, {
                [styles.narrow]: narrow,
            })}
            {...rest}
        />
    );
}

export function Title(
    props: Dialog.DialogTitleProps & React.RefAttributes<HTMLDivElement>,
) {
    return <Dialog.Title {...props} />;
}

export function Footer({ children }: { children: React.ReactNode }) {
    return <div className={styles.footer}>{children}</div>;
}

export function Close(
    props: Dialog.DialogCloseProps & React.RefAttributes<HTMLButtonElement>,
) {
    return <Dialog.Close {...props} />;
}
