import AboutUs from '../components/aboutUs'
import Layout from '../components/layout'
import Lightbox from '../components/lightbox'
import PageNavigation from '../components/pageNavigation'

import styles from '../styles/nofragrance.module.scss'

export default function NoFragrance() {
    const title = "Fragrance-Free Policy";
    const navItems = [
        ['#c1', 'Policy'],
        ['#c2', 'Fragrance-Free Product Guide']
    ];
    const breadcrumbPath = [
        { page: 'home', label: 'Symphonic Chorus Home' },
        { page: 'memberInfo', label: 'Member Information' },
        { page: '', label: title }
    ];

    const introduction = (
        <>
            <PageNavigation items={navItems}/>
        </>
    );

    const sidebar = (
        <>
        </>
    );

    return (
        <Layout
            title={title}
            introduction={introduction}
            sidebar={sidebar}
            breadcrumbs={breadcrumbPath}>
            <div className={styles.content}>
                <h2 id="c1">Policy</h2>
                <p>The chorus has a fragrance-free policy. Because we are a large group and some members are sensitive or allergic to fragrances, it is important that members refrain from wearing scented products to rehearsals or performances. Here are specific guidelines for all rehearsals and peformances:</p>
                <ul>
                    <li>Do not wear perfume, cologne, scented aftershave or any other products that contain fragrance.</li>
                    <li>Do not wear hair products, lotions, deoderants or other products with fragrance as one of the ingredients.</li>
                </ul>
                <h3>Tips for compliance</h3>
                <ul>
                    <li>Look for <em>fragrance free</em> on the label.</li>
                    <li>Note that <em>unscented</em> is not the same as <em>fragrance free.</em> Unscented products have a masking fragrance, which will be noted in the label.</li>
                    <li>Make sure the clothes you are wearing have not been spritzed with perfume at your last gala event.</li>
                </ul>
                <h2 id="c2">Fragrance-Free Product Guide</h2>
                <ul>
                    <li>Almay and Clinique have extensive lines of fragrance-free cosmetics and beauty products, including deodorant (Almay). Almay will be in your local drugstore, Clinique in the mall.</li>
                    <li>Fragrance-free body lotions are made by Curel, Cetaphil, Oil of Olay, Neutrogen, Eucerin, etc.</li>
                    <li>Hairspray: ABBA sells fragrance-free <em>Pure Finish Spray</em> (used to be Zeroscent) in beauty supply stores and online.  Allercreme also has a fragrance free hairspray.  See health-food store brands below, and check the links. In the worst case, spring for Unscented hair spray.</li>
                    <li>Health food stores: Magick Botanicals shampoo, hair gel and hair spray, Free and Clear products and Aloe Vera 80 Styling Spray.  Face and body cleansers like Kiss My Face fragrance-free soap and Nutribiotic Fragrance-Free Non-soap Skin Cleanser. Tom's of Maine and Jason have fragrance-free natural deodorant.</li>
                    <li>Products that say "For sensitive skin" are likely to be fragrance free.</li>
                </ul>
            </div>
        </Layout>
    );
}
