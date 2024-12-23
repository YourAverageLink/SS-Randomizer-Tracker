export default function Contributor({
    name,
    links,
}: {
    name: string;
    links: { [platform: string]: string | undefined };
}) {
    return (
        <span style={{ padding: '1%' }}>
            <span style={{ fontWeight: '500' }}>{name}</span>
            {Object.entries(links).map(([type, link]) => (
                <a key={link} href={link} aria-label={type} style={{ padding: '0.25%' }}>
                    <i className={`fab fa-${type}`} />
                </a>
            ))}
        </span>
    );
}
