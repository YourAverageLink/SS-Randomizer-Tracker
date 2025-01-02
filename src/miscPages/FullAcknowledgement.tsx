import { Link } from 'react-router-dom';
import Contributor from '../additionalComponents/Contributor';
import contributors from '../data/contributors.json';
import styles from './FullAcknowledgement.module.css';
import DiscordButton from '../additionalComponents/DiscordButton';

function ContributorTable({
    contributorsList,
}: {
    contributorsList: {
        name: string;
        links: { [platform: string]: string | undefined };
        attributions?: string[];
    }[];
}) {
    return (
        <div className={styles.contributorsList}>
            {contributorsList.map((contributor) => (
                <div key={contributor.name}>
                    <div>
                        <div>
                            <Contributor
                                name={contributor.name}
                                links={contributor.links}
                            />
                        </div>
                    </div>
                    {contributor.attributions?.map((attribution, index) => (
                        <div key={index}>
                            {attribution}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default function FullAcknowledgement() {
    const rows = [
        ['Lead Developer', contributors.creators],
        ['Contributors', contributors.contributors],
        ['Additional Shoutouts', contributors.additionalShoutouts],
    ] as const;
    return (
        <div className={styles.ackContainer}>
            <div>
                <Link to="/">Return to Tracker</Link>
            </div>
            {rows.map(([header, list]) => {
                return (
                    <div key={header}>
                        <div className={styles.ackGroupHeader}>{header}</div>
                        <ContributorTable contributorsList={list} />
                    </div>
                );
            })}
            <div>
                <span style={{ paddingRight: '1%' }}>
                    <a href="https://github.com/robojumper/SS-Randomizer-Tracker/tree/new-logic-tracker">
                        View the Source Code
                        <i
                            style={{ paddingLeft: '0.3%' }}
                            className="fab fa-github"
                        />
                    </a>
                </span>
                <span>
                    <DiscordButton />
                </span>
            </div>
        </div>
    );
}
