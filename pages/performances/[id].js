import AboutUs from '../../components/aboutUs'
import Collaborator from '../../components/collaborator';
import { compareISODate, DayAndDate, FullDate, TimeOfDay, Weekday } from '../../components/dateTime';
import Layout from "../../components/layout";
import Location from '../../components/location';
import PageLink from '../../components/pageLink';
import PageNavigation from '../../components/pageNavigation';
import PieceCitation from '../../components/pieceCitation';
import SpaceSeparatedPhrase from '../../components/spaceSeparatedPhrase';

import { Model } from "../../common/model";

import Link from 'next/link';

import styles from '../../styles/performances_id.module.scss';

function PracticeFileSection({ section }) {
    return (
        <>
            <h2>{section.title}</h2>
            {section.files.length > 0 && <ol>
                {section.files.map((f, index) => (
                    <li key={index}>{f.title} <Link href={f.assetPath}>{'(' + f.assetLabel + ')'}</Link></li>
                ))}
            </ol>}
            {section.externalFolder && <ol>
                <li key={1}><a href={section.externalFolder} target="_blank">External Folder containing Practice Files</a></li>
            </ol>}
            {section.externalLink && <ol>
                <li key={1}><a href={section.externalLink} target="_blank">{section.externalLink}</a></li>
            </ol>}
        </>
    );
}

function Introduction({ navItems }) {
    return (
        <div>
            <PageNavigation items={navItems} />
        </div>
    );
}

function Sidebar() {
    return (
        <div>
            <AboutUs />
        </div>
    );
}

function EventList({ events }) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Time</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {events.map((e, index) => (
                    <tr key={index}>
                        <td><Weekday iso={e.start} /></td>
                        <td><FullDate iso={e.start} /></td>
                        <td><Location name={e.location} /></td>
                        {e.end && <td><TimeOfDay iso={e.start} /> - <TimeOfDay iso={e.end} /></td>}
                        {!e.end && <td><TimeOfDay iso={e.start} /></td>}
                        <td>
                            {e.description}
                            {e.notes && 0 < e.notes.length &&
                                <SpaceSeparatedPhrase>
                                    .
                                    {e.notes.map((n, index) => n)}
                                </SpaceSeparatedPhrase>
                            }
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function Rehearsals({ quarter }) {
    var eventList = [];

    eventList = eventList.concat(quarter.tuttiRehearsals.map((r) => (
        {
            start: r.start,
            end: r.end,
            location: r.location,
            description: 'Tutti rehearsal',
            notes: r.notes,
        }
    )));

    eventList = eventList.concat(quarter.sectionalsTenorBass.map((r) => (
        {
            start: r.start,
            end: r.end,
            location: r.location,
            description: 'T/B Sectional (optional, but warmly encouraged)',
            notes: r.notes
        }
    )));

    eventList = eventList.concat(quarter.sectionalsSopranoAlto.map((r) => (
        {
            start: r.start,
            end: r.end,
            location: r.location,
            description: 'S/A Sectional (optional, but warmly encouraged)',
            notes: r.notes
        }
    )));

    eventList.sort((a, b) => compareISODate(a.start, b.start));

    return (<EventList events={eventList} />);
}

function DressRehearsals({ quarter }) {
    const Description = ({ rehearsal }) => {
        return (
            <>
                <span>Dress rehearsal</span>
                {rehearsal.repertoire && (<RepertoireList repertoire={rehearsal.repertoire.full} />)}
            </>
        )
    }

    const eventList = quarter.dressRehearsals.map((dr) => (
        {
            start: dr.start,
            location: dr.location,
            description: (<Description rehearsal={dr} />),
        }
    ));

    return (<EventList events={eventList} />);
}

function Concerts({ quarter }) {
    const Description = ({ concert }) => {
        return (
            <>
                <span>Concert call for <TimeOfDay iso={concert.start} /> concert</span>
                {concert.repertoire && (<RepertoireList repertoire={concert.repertoire.full} />)}
            </>
        )
    }

    const eventList = quarter.concerts.map((c) => (
        {
            start: c.call,
            location: c.location,
            description: (<Description concert={c} />),
        }
    ));

    return (<EventList events={eventList} />);
}

function RepertoireList({ repertoire }) {
    return (
        <ul>
            {repertoire.map((p, index) => (<li key={index}><PieceCitation data={p} /></li>))}
        </ul>
    )
}

function Overview({ quarter, shortForm }) {
    const firstRehearsal = (0 < quarter.tuttiRehearsals.length ? quarter.tuttiRehearsals[0] : null);

    return (
        <>
            <tr>
                <td>Repertoire:</td>
                <td><RepertoireList repertoire={quarter.repertoire.full} /></td>
            </tr>

            {0 < quarter.soloists.length &&
                (<tr>
                    <td>Soloists:</td>
                    <td>
                        <ul>
                            {quarter.soloists.map((s, index) => (<li key={index}>{s.name}, {s.part}</li>))}
                        </ul>
                    </td>
                </tr>)
            }

            {0 < quarter.collaborators.length &&
                (<tr>
                    <td>In collaboration with:</td>
                    <td>
                        <ul>
                            {quarter.collaborators.map((c, index) => (<li key={index}><Collaborator name={c} /></li>))}
                        </ul>
                    </td>
                </tr>)
            }

            <tr>
                <td>First rehearsal:</td>
                <td>
                    <ul>
                        <li>
                            {firstRehearsal && (
                                <>
                                    <DayAndDate iso={firstRehearsal.start} /> at <TimeOfDay iso={firstRehearsal.start} />, <Location name={firstRehearsal.location} />. {0 < firstRehearsal.notes.length &&
                                        <SpaceSeparatedPhrase>
                                            {firstRehearsal.notes.map((n, index) => n)}
                                        </SpaceSeparatedPhrase>
                                    }
                                </>
                            )}
                        </li>
                    </ul>
                </td>
            </tr>

            {!shortForm &&
                <tr>
                    <td><PageLink page="memberInfo" anchor="auditions">Auditions:</PageLink></td>
                    <td>
                        <ul>
                            <li>See the <PageLink page="memberInfo" anchor="auditions">Auditions</PageLink> section of our Member Page for information about how to audition.</li>
                        </ul>
                    </td>
                </tr>
            }

            <tr>
                <td>Dress rehearsals:</td>
                <td>
                    <ul>
                        {quarter.dressRehearsals.map((dr, index) => (
                            <li key={index}>
                                <DayAndDate iso={dr.start} />, <TimeOfDay iso={dr.start} />, <Location name={dr.location} />
                            </li>
                        ))}
                    </ul>
                </td>
            </tr>

            <tr>
                <td>Concerts:</td>
                <td>
                    <ul>
                        {quarter.concerts.map((c, index) => (<li key={index}><DayAndDate iso={c.start} />, <TimeOfDay iso={c.start} /> in <Location name={c.location} /> (<TimeOfDay iso={c.call} /> call)</li>))}
                    </ul>
                </td>
            </tr>
        </>
    );
}

export default function RehearsalSchedule({ currentQuarter, previousQuarters, nextQuarters }) {
    const title = "Rehearsal and Performance Schedule";

    const breadcrumbPath = [
        { page: 'home', label: 'Symphonic Chorus Home' },
        { page: 'memberInfo', label: 'Member Information' },
        { page: '', label: title }
    ];

    const navItems = [
        ['#overview', 'Overview'],
        ['#rehearsals', 'Rehearsals'],
        ['#dress-rehearsals', 'Dress Rehearsals'],
        ['#concerts', 'Concerts'],
        ['#looking-ahead', 'Looking Ahead'],
        ['#looking-back', 'Looking Back'],
    ];

    return (
        <Layout
            title={title}
            introduction={<Introduction navItems={navItems} />}
            sidebar={<Sidebar />}
            breadcrumbs={breadcrumbPath}>
            <div className={styles.rehearsalSchedule}>
                <h2 id="overview">Overview</h2>
                <div className={styles.overview}>
                    <table>
                        <tbody>
                            <Overview quarter={currentQuarter} />
                        </tbody>
                    </table>
                </div>

                <h2 id='rehearsals'>Rehearsals</h2>
                <div><Rehearsals quarter={currentQuarter} /></div>

                <h2 id='dress-rehearsals'>Dress Reherasals</h2>
                <div><DressRehearsals quarter={currentQuarter} /></div>

                <h2 id='concerts'>Concerts</h2>
                <div><Concerts quarter={currentQuarter} /></div>

                {0 < currentQuarter.practiceFiles.length && (
                    <>
                        <div className={styles.practiceFiles}>
                            {currentQuarter.practiceFiles.map((p, index) => (
                                <PracticeFileSection section={p} key={index} />
                            ))}
                        </div>
                    </>
                )}

                {0 < nextQuarters.length && (
                    <>
                        <h2 id='looking-ahead'>Looking Ahead</h2>
                        <table>
                            {nextQuarters.map((q, index) => (
                                <tbody key={index}>
                                    <tr><td className={styles.subhead} colSpan="2"><PageLink collection="performances" page={q}>{q.quarter}</PageLink></td></tr>
                                    <Overview quarter={q} shortForm="true" />
                                </tbody>
                            ))}
                        </table>
                    </>
                )}

                {0 < previousQuarters.length && (
                    <>
                        <h2 id='looking-back'>Looking Back</h2>
                        <div className={styles.overview}>
                            <table>
                                {previousQuarters.map((q, index) => (
                                    <tbody key={index}>
                                        <tr><td className={styles.subhead} colSpan="2"><PageLink collection="performances" page={q}>{q.quarter}</PageLink></td></tr>
                                        <Overview quarter={q} shortForm="true" />
                                    </tbody>
                                ))}
                            </table>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}

export async function getStaticProps({ params }) {
    const model = await Model.getModel();

    const props = {
        currentQuarter: await model.getPerformanceById(params.id).getStaticProps(),
        previousQuarters: await Promise.all(model.getPerformancesAfterId(params.id, -3).map(async (p) => p.getStaticProps())),
        nextQuarters: await Promise.all(model.getPerformancesAfterId(params.id, 3).map(async (p) => p.getStaticProps()).reverse()),
    }

    return {
        props: props
    }
}

export async function getStaticPaths() {
    const model = await Model.getModel();

    const result = {
        paths: model.performances.map((p) => ({ params: { id: p.id } })),
        fallback: false
    };

    return result;
}

// Setting unstable_runtimeJS to false removes all Next.js/React scripting from
// the page when it is exported. This creates a truly static HTML page, but
// should be used with caution because it does remove all client-side React
// processing. So, the page needs to be truly static, or the export will yield
// a page that is incorrect.
export const config = {
    unstable_runtimeJS: false
};
