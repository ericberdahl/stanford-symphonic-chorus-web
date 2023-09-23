import { createDate } from './dateTimeUtils';

import { DateTime } from 'luxon';

export type SerializedRegistrationInfo = {
    auditionLink?:      string; // web site (without the http:// prefix) on which audition signups will be posted
    preregisterDate?:   string; // 'YYYY-MM-DD' : date on which registration information will be sent
    registrationLink?:  string; // web site (without the http:// prefix) on which registration will be posted
}

export type RegistrationInfoStaticProps = {
    auditionLink:       string;
    preregisterDate:    string;
    registrationLink:   string;
}

export class RegistrationInfo {
    readonly auditionLink       : string;
    readonly preregisterDate    : DateTime;
    readonly registrationLink   : string;

    private constructor(auditionLink        : string,
                        preregisterDate     : DateTime,
                        registrationLink    : string)
    {
        this.auditionLink       = auditionLink;
        this.preregisterDate    = preregisterDate;
        this.registrationLink   = registrationLink;
    }

    async getStaticProps() : Promise<RegistrationInfoStaticProps> {
        return {
            auditionLink:       this.auditionLink || null,
            preregisterDate:    this.preregisterDate?.toISO() || null,
            registrationLink:   this.registrationLink || null,
        };
    }

    static async deserialize(data : SerializedRegistrationInfo) : Promise<RegistrationInfo> {
        const result = new RegistrationInfo(data.auditionLink,
                                            data.preregisterDate ? createDate(data.preregisterDate) : null,
                                            data.registrationLink);
        
        return result;
    }

}