import zendesk, {ClientOptions} from 'node-zendesk';

import {AppContext} from 'mattermost-redux/types/apps';

import {Routes} from '../utils';
import {newTokenStore, newConfigStore} from '../store';

interface Tickets {
    create(ticket: any): any;
    exportAudit(id: number): any;
}

interface TicketForms {
    list(): any;
}

interface TicketFields {
    list(): any;
}

interface Triggers {
    update(id: number): any;
    delete(id: number): any;
    create(trigger: any): any;
    search(query: string): any;
}

interface OauthTokens {
    current(): any;
    revoke(id: number): any;
}

interface Users {
    show(id: number): any;
}

// expose on the methods that will be used by the app
export interface ZDClient {
    tickets: Tickets;
    ticketforms: TicketForms;
    ticketfields: TicketFields;
    triggers: Triggers;
    oauthtokens: OauthTokens;
    users: Users;
}

export const newZDClient = async (context: AppContext): Promise<ZDClient> => {
    // get active mattermost user ID
    const mmUserID = context.acting_user_id || '';
    const tokenStore = newTokenStore(context);
    const token = await tokenStore.getToken(mmUserID);
    if (!token) {
        throw new Error('Failed to get user access_token');
    }
    const tokenValue = token.token;
    const config = await newConfigStore(context).getValues();
    const remoteUri = config.zd_url + Routes.ZD.APIVersion as string;
    const options: ClientOptions = {
        username: '',
        token: tokenValue,
        remoteUri,
        oauth: true,
    };

    return zendesk.createClient(options) as ZDClient;
};
