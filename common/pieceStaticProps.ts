import { IComposer, IPiece } from "./piece";

export type ComposerStaticProps = {
    fullName : string;
    familyName : string;
};

export function composerStaticProps(composer : IComposer) : ComposerStaticProps {
    return {
        fullName:   composer.fullName,
        familyName: composer.familyName
    };
}
