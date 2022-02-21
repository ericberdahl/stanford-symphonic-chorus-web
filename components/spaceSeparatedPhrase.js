import { Children, Fragment } from 'react';

export default function SpaceSeparatedPhrase({ children, separator }) {
    separator = separator || ' '
    children = Children.toArray(children);

    return (
        <>
            {children.map((child, index) => {
                return (
                    <Fragment key={index}>
                        {0 < index && separator}
                        {child}
                    </Fragment>
                );
            })}
        </>
    );
}
