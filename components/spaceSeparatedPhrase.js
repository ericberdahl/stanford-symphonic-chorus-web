import { Children } from 'react';

export default function SpaceSeparatedPhrase({ children }) {
    children = Children.toArray(children);

    return (
        <>
            {children.map((child, index) => {
                return (
                    <>
                        {0 < index && ' '}
                        {child}
                    </>
                );
            })}
        </>
    );
}
