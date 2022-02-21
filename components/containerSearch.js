import styles from '../styles/containerSearch.module.scss'

export default function ContainerSearch(props) {
    return (
        <div className={styles.containerSearch}>
            <div>
                <form action="http://www.stanford.edu/hpcgi/page-route.cgi" method="post">
                    <div className={styles.searchFilters}>
                        <input name="search_type" type="radio" id="web" value="web" defaultChecked readOnly/> <label htmlFor="web">Web</label>
                        <input name="search_type" type="radio" id="people" value="people" readOnly/> <label htmlFor="people">People</label>
                    </div>
                    <div className={styles.searchBox}>
                        <input className={styles.searchString} onFocus={(e) => e.currentTarget.value=''} type="text" defaultValue="Search…" name="search_string"/>
                        <button className={styles.searchButton} type="submit" value="Submit" readOnly>Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
