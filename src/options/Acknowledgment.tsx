import { Link } from 'react-router-dom';
import Contributor from '../additionalComponents/Contributor';
import contributors from '../data/contributors.json';
import DiscordButton from '../additionalComponents/DiscordButton';
import styles from './Acknowledgement.module.css';

export default function Acknowledgement() {
    return (
        <div className={styles.ackContainer}>
            <div>Tracker by</div>
            <div className={styles.contributorsList}>
                {contributors.creators.map((creator) => (
                    <Contributor
                        key={creator.name}
                        name={creator.name}
                        links={creator.links}
                    />
                ))}
            </div>
            <div>Additional contributions by</div>
            <div className={styles.contributorsList}>
                {contributors.contributors.map((creator) => (
                    <Contributor
                        key={creator.name}
                        name={creator.name}
                        links={creator.links}
                    />
                ))}
            </div>
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
            <br />
            <div>
                <Link to="/acknowledgement">Full Acknowledgement</Link>
            </div>
        </div>
    );
}
