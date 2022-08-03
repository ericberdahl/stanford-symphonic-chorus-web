import getConfig from 'next/config'

import { DateTime } from 'luxon';

const { serverRuntimeConfig } = getConfig()

import { strict as assert } from 'assert';

export type SerializedAuditionInfo = {
    date?:              string; // 'YYYY-MM-DD' : date on which auditions will be held
    signupPostDate?:    string; // 'YYYY-MM-DD' : date on which audition signups will be posted
    signupPostLink?:    string; // web site (without the http:// prefix) on which audition signups will be posted
}

export type AuditionInfoStaticProps = {
    date:           DateTime;
    signupPostDate: DateTime;
    signupPostLink: string;
}

export class AuditionInfo {
    readonly date           : DateTime;
    readonly signupPostDate : DateTime;
    readonly signupPostLink : string;

    private constructor(date : DateTime,
                        signupPostDate : DateTime,
                        signupPostLink : string)
    {
        this.date = date;
        this.signupPostDate = signupPostDate;
        this.signupPostLink = signupPostLink;

        assert.ok((this.signupPostDate && this.signupPostLink) || (!this.signupPostDate && !this.signupPostLink), "AuditionInfo.signupPostDate and AuditionInfo.signupPostLink must either both be specified or both be unspecified");
    }

    async getStaticProps() : Promise<AuditionInfoStaticProps> {
        return {
            date:           this.date?.toISO() || null,
            signupPostDate: this.signupPostDate?.toISO() || null,
            signupPostLink: this.signupPostLink,
        };
    }

    static async deserialize(data : SerializedAuditionInfo) : Promise<AuditionInfo> {
        const result = new AuditionInfo(data.date ? DateTime.fromFormat(data.date, 'yyyy-MM-dd', { setZone: serverRuntimeConfig.timezone }) : null,
                                        data.signupPostDate ? DateTime.fromFormat(data.signupPostDate, 'yyyy-MM-dd', { setZone: serverRuntimeConfig.timezone }) : null,
                                        data.signupPostLink);
        
        return result;
    }

}