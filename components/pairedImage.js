import Lightbox from '../components/lightbox'

export default function PairedImage({ routes }) {
    const image = (routes?.pdf ? routes?.pdf : routes?.jpg);

    if (!image) {
        return (<img src="/images/M@S-roundedges.gif" alt=""/>);
    };

    const MAX_DIMENSION = 900;
    const largestDimension = Math.max(routes.width, routes.width);
    const reductionFactor = (largestDimension < MAX_DIMENSION ? 1.0 : largestDimension/MAX_DIMENSION);
    const width = Math.round(routes.width/reductionFactor);
    const height = Math.round(routes.height/reductionFactor);
    
    return (
        <Lightbox
            image={image}
            display={routes.jpg}
            width={width}
            height={height}
            caption={routes.caption}
            img_width={107}/>
    );
}

