import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Contributor from './additionalComponents/Contributor';
import contributors from './data/contributors.json';
import DiscordButton from './additionalComponents/DiscordButton';

export default function Acknowledgement() {
    return (
        <div style={{ textAlign: 'center' }}>
            <Row>
                <Col>
                    Tracker by
                </Col>
            </Row>
            {
                contributors.creators.map((creator) => (
                    <Contributor key={creator.name} name={creator.name} links={creator.links} />
                ))
            }
            <Row />
            <Row style={{ paddingTop: '1%' }}>
                <Col>
                    Additional contributions by
                </Col>
            </Row>
            {
                contributors.contributors.map((contributor) => (
                    <Contributor key={contributor.name} name={contributor.name} links={contributor.links} />
                ))
            }
            <br />
            <Row>
                <Col>
                    <span style={{ padding: '1%' }}>
                        <a href="https://github.com/robojumper/SS-Randomizer-Tracker/tree/new-logic-tracker">
                            View the Source Code
                            <i style={{ paddingLeft: '0.3%' }} className="fab fa-github" />
                        </a>
                    </span>
                    <span>
                        <DiscordButton />
                    </span>
                </Col>
            </Row>
            <Row style={{ padding: '1.5%' }}>
                <Col>
                    <Link to="/acknowledgement">Full Acknowledgement</Link>
                </Col>
            </Row>
        </div>
    );
}
