import { Performance  } from './performance';

export type PerformanceRefStaticProps = {
    id : string;
    quarter : string;
}

export function performanceRefStaticProps(performance : Performance) : PerformanceRefStaticProps {
    return {
        id:         performance.id,
        quarter:    performance.quarter
    }
}
