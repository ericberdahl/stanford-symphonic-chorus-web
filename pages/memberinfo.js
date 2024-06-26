import Covid19MitigationPolicy from '../components/covid19MitigationPolicy'
import { DayAndDate, MonthAndYear } from '../components/dateTime'
import FileLinks from '../components/fileLinks'
import Layout from '../components/layout'
import PageLink from '../components/pageLink'
import PageNavigation from '../components/pageNavigation'
import Person from '../components/person'
import SpaceSeparatedPhrase from '../components/spaceSeparatedPhrase'
import TitledSegment from '../components/titledSegment'

import { Model } from '../common/model'

import Link from 'next/link'

import styles from '../styles/memberinfo.module.scss'

function RegistrationLink({ info }) {
    const emailedLink = (preregisterDate) => {
        return (
            <p>
                Singers must register online using the webform which will be emailed to last quarter's members in <MonthAndYear iso={preregisterDate}/>.
                New members please contact <Person role="administrator" subject="Re SSC Registration Link"/> to receive the registration link.
            </p>
        );
    }

    const webformLink = (registrationLink) => {
        return (
            <p>
                Singers must register using our <a href={'//' + registrationLink} target="_blank">online webform</a>.
            </p>
        );
    }

    return (info.registrationLink ?
                webformLink(info.registrationLink) :
                emailedLink(info.preregisterDate));
}

function Introduction({ navItems, quarter }) {
    // TRICKY:
    // If the member info page ever needs to be displayed for historical performances, the MonthAndYear logic
    // below needs to be adjusted to accommodate the fact that we don't have preregister dates for all
    // performances in the historical record.

    const scoreAdvisory = (quarter.scorePrice ?
        (<>costs {quarter.scorePrice}</>) :
        (<>will be sold at the first three rehearsals</>));

        // TODO update webform notice to include link to the web form
    return (
        <div className={styles.introduction}>
            <PageNavigation items={navItems}/>

            <TitledSegment title="Member Tools">
                <p><PageLink collection="performances" page={quarter}>Rehearsal Schedule</PageLink></p>
                {quarter.syllabusRoutes &&
                    <p>
                        {quarter.quarter} Syllabus (<FileLinks files={quarter.syllabusRoutes}/>)
                    </p>
                }
                <p><Link href="/assets/Choral Studies Liability Waiver Form.pdf">Choral Studies Liability Waiver</Link></p>

                {quarter.registrationFee &&
                    <p>
                        Registration fee is {quarter.registrationFee} (waived for students and faculty).
                        The score for this quarter {scoreAdvisory}.
                    </p>
                }
                
                <p>
                    By participating in the Stanford Symphonic Chorus, you acknowledge that you have read the Assumption of Risk, Release of Claims, Indemnification and Hold Harmless Agreement (the "<a href="/assets/Choral Studies Liability Waiver Form.pdf" target="_blank">Choral Studies Liability Waiver</a>"), understand its meaning and effect, and agree to be bound by it.
                </p>
            </TitledSegment>
        </div>
    );
}

function Sidebar({ quarter }) {
    return (
        <div className={styles.sidebar}>
            <TitledSegment title="Music-Learning CD Sites">
                <p>
                    These sites offer CDs or mp3 files to aid singers in learning choral parts.
                </p>
                <ul>
                    <li><a href="http://www.choralia.net" target="_blank">Choralia.net</a></li>
                    <li><a href="http://www.note-perfect.com/" target="_blank">Note Perfect</a></li>
                    <li><a href="http://songlearning.com/" target="_blank">SongLearning.com</a></li>
                </ul>
                <p>
                    The Choral Public Domain Library is a great resource for music scores and sound files that are in the public domain.
                </p>
                <ul>
                    <li><a href="http://www1.cpdl.org/wiki/index.php/Main_Page" target="_blank">Choral Public Domain Library</a></li>
                </ul>
            </TitledSegment>
            <div id="folders">
                <TitledSegment title="Music Folders">
                        <p>
                            Black music folders are available at these sites.
                        </p>
                        <ul>
                            <li><a href="http://musicfolder.com/" target="_blank">MusicFolder.Com</a></li>
                            <li><a href="http://www.mymusicfolders.com/index.html" target="_blank">mymusicfolders.com</a></li>
                        </ul>
                </TitledSegment>
            </div>
            <TitledSegment title={<PageLink collection="performances" page={quarter}>Rehearsal Schedule</PageLink>}>
                <p>
                    Listing of rehearsals, sectionals and performances for the current quarter.
                </p>
            </TitledSegment>
        </div>
    );
}

function AuditionRequest({ currentQuarter }) {
    return (<>
        If you are interested in auditioning for the chorus for the {currentQuarter.quarter} quarter, please email <Person role="administrator" subject="Regarding auditions"/>.
    </>)
}

function AuditionSignup({ auditionLink }) {
    return (<>
        New members can sign up for auditions at our <a href={"//" + auditionLink} target="_blank">online scheduling link</a>.
    </>);
}

function AuditionInfo({ currentQuarter })
{
    return (currentQuarter.registrationInfo?.auditionLink ?
                <AuditionSignup auditionLink={currentQuarter.registrationInfo.auditionLink}/> :
                <AuditionRequest currentQuarter={currentQuarter}/>);
}

function JoiningTheChorus({ currentQuarter })
{
    // TODO fix up auditions to point to the online form
    return (<>
        <h2 id="joining">Joining the Chorus</h2>
        <p>
            The Stanford Symphonic Chorus is open to all students, faculty, staff and any other residents of the community interested in singing wonderful music.
        </p>
        <p>
            Members who are not students or faculty pay a modest {currentQuarter.registrationFee && <span>(currently {currentQuarter.registrationFee})</span>} participation fee.
            This money helps to offset expenses, the largest of which is contracting soloists and orchestras.
        </p>
        <RegistrationLink info={currentQuarter.registrationInfo}/>
        <p>
            After submitting the online form, you will receive an email confirmation.
            Please be sure to print that email confirmation and bring it with you to your first rehearsal, along with cash or check (made out to Stanford University) for any fees or music.
            If you do not receive the confirmation right away, check your Junk folder to be sure it didn't get caught as spam.
        </p>

        <h3>Auditions</h3>
        <p>
            New members are normally accepted by audition at the beginning of each academic quarter. <AuditionInfo currentQuarter={currentQuarter}/>
        </p>

        <p>Auditions take about ten minutes, are very "user-friendly," and consist of:</p>
        <ul>
            <li>
                Vocalizing (singing scale passages, or similar) with piano support to determine range.
            </li>
            <li>
                Pitch memory exercises (we'll play three or four notes in sequence on the piano, and you sing them back).
            </li>
            <li>
                Picking pitches out of a chord texture (we play three pitches simultaneously on the piano, and ask you to sing the highest, middle, or lowest pitch).
            </li>
            <li>Simple sight singing</li>
            <li>
                30 seconds to a minute of a prepared song.
                This can be anything that you enjoy singing: art song, aria, musical theatre number, jazz tune, hymn tune, children's song, or the ever popular choices of: first verse of <em>My country 'tis of thee</em>, <em>Amazing Grace</em>, <em>Edelweiss</em>, etc.
            </li>
        </ul>
        {currentQuarter.membershipLimit &&
            <p>
                NB: Due to facilities restrictions, the Symphonic Chorus is capped at a <em><strong>maximum of {currentQuarter.membershipLimit} members</strong></em>.
                For potential new members wishing to join the ensemble, please understand that members who have made the full year-long commitment in previous seasons have first priority.
                New members will be accepted as space allows, with voice part and section balances taken into account.
            </p>
        }
    </>)
}

function MemberExpectations({ currentQuarter })
{
    return (<>
        <h2 id="expectations">Expectations</h2>

        <h3>Learning the Music</h3>
        <p>
            Each singer is expected to learn the music assigned for each rehearsal on his or her own. Beyond the first reading of a work, rehearsal time will be devoted to the development of ensemble sound, interpretation, and other musical matters.
            It is further expected that each singer will make a reasonable effort to develop his or her own vocal skills, and will make every effort to contribute in a positive manner to the work of the group.
        </p>
        <h3>Concert Dress</h3>
        <p>
            All black: shirt/slacks, blouse/skirt, dress. Black socks/hose, black shoes.
        </p>

        <h3>Covering Your Music</h3>
        <p>
            For performances music must be put in a black folder or notebook, or bound with a black cover.
            Don't wait until the last minute to find a cover which will be practical in performance!
            (See <a href="#folders">Music Folders</a> on this page for resources.)
        </p>

        <h3><PageLink page="noFragrance">Fragrance-Free Policy</PageLink></h3>
        <p>
            Several people in the chorus are particularly sensitive to scented products such as perfume and hair spray; all of us have to sing in close quarters and benefit by having air to breathe which is as pure as possible.
            On all rehearsal days, and especially on dress rehearsal and performance days, we request you do not use any such products.
            For further information, including information on obtaining scent-free alternatives, see <PageLink page="noFragrance">extensive guidelines.</PageLink>
        </p>

        <Covid19MitigationPolicy/>
    </>)
}

function Rehearsals({ currentQuarter }) {
    return (<>
        <h2 id="rehearsals">Rehearsals</h2>
        <p>
            Rehearsals are held Monday evenings from 7:30 to 10:00 in Campbell Recital Hall in the Braun Music Building, but please be <em>early</em> for the first rehearsal, since it will take extra time to get everyone signed up and to distribute the music, which will be available at the rehearsal.
            Sign ups start at <strong>6:30 p.m.</strong>
        </p>

        <p>
            In addition, there are optional but warmly encouraged sectional rehearsals on selected Wednesday evenings from 5:30 to 6:30.
            Just before the performance we typically have two "dress rehearsals," also mandatory, when we rehearse with the orchestra, usually in the hall in which we will be performing.
            Concert dress is not required or even recommended at these rehearsals.
            Other rehearsals are typically accompanied by piano only.
        </p>

        <p>
            Members may miss up to two required rehearsals during the quarter.
            Members who miss more than two required rehearsals without prior arrangement with the director will not be allowed to participate in the performance.
            You must notify the director in advance if for any reason you must miss all or part of a rehearsal.
            For those participating for graded credit, every two unexcused absences may result in the lowering of the final grade by one letter.
        </p>

        <h3>Music</h3>
        <p>
            The music to be performed is always available at the first three rehearsals.
        </p>

        <h3>Parking</h3>
        <p>
            Parking for rehearsals can usually be found in the large lot on Mayfield Avenue closest to Braun (and Tresidder Student Union).
            There is no parking enforcement after 4 p.m. on weekdays.
            You may park for free in any pay or permit slot (except for disabled slots) for rehearsal.
        </p>
    </>)
}

export default function MemberInfo({ currentQuarter }) {
    const title = "Member Information";
    const navItems = [
        ['#joining', 'Joining the Chorus'],
        ['#expectations', 'Expectations'],
        ['#rehearsals', 'Rehearsals']
    ];
    const breadcrumbPath = [
        { page: 'home', label: 'Symphonic Chorus Home' },
        { page: '', label: title }
    ];

    return (
        <Layout
            title={title}
            introduction={<Introduction navItems={navItems} quarter={currentQuarter}/>}
            sidebar={<Sidebar quarter={currentQuarter}/>}
            breadcrumbs={breadcrumbPath}>
            <div className={styles.content}>
                <JoiningTheChorus currentQuarter={currentQuarter}/>
                <MemberExpectations currentQuarter={currentQuarter}/>
                <Rehearsals currentQuarter={currentQuarter}/>
            </div>
        </Layout>
    );
}

export async function getStaticProps({ params }) {
    const model = await Model.getModel();
    
    const props = {
        currentQuarter: await model.currentQuarter.getStaticProps(),
    }

    return {
        props: props
    }
}

// Setting unstable_runtimeJS to false removes all Next.js/React scripting from
// the page when it is exported. This creates a truly static HTML page, but
// should be used with caution because it does remove all client-side React
// processing. So, the page needs to be truly static, or the export will yield
// a page that is incorrect.
export const config = {
    unstable_runtimeJS: false
};
