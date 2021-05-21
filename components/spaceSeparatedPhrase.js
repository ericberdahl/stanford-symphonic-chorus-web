import { Children } from 'react';

export default function SpaceSeparatedPhrase({ children, separator }) {
    separator = separator || ' '
    children = Children.toArray(children);

    return (
        <>
            {children.map((child, index) => {
                return (
                    <>
                        {0 < index && separator}
                        {child}
                    </>
                );
            })}
        </>
    );
}
