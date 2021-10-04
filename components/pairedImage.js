import Lightbox from '../components/lightbox'

export default function PairedImage({ routes, width }) {
    const image = (routes?.pdf ? routes?.pdf : routes?.jpg);
    
    width = (width || 107);

    if (!image) {
        return (<img src="/images/M@S-roundedges.gif" alt=""/>);
    };

    const MAX_DIMENSION = 900;
    const largestDimension = Math.max(routes.width, routes.height);
    const reductionFactor = (largestDimension < MAX_DIMENSION ? 1.0 : largestDimension/MAX_DIMENSION);
    const boxWidth = Math.round(routes.width/reductionFactor);
    const boxHeight = Math.round(routes.height/reductionFactor);
    
    return (
        <Lightbox
            image={image}
            display={routes.jpg}
            width={boxWidth}
            height={boxHeight}
            caption={routes.caption}
            img_width={width}/>
    );
}

