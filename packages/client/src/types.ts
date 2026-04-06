export type Options = {
    relayUrl?: string;
}

export type PoliciesMapConfigs = {
    "anti_snipe_window": {
        windowMs?: number;
    },
    "fair_queue": {
        something?: string;
    }
};

export type PolicyName = keyof PoliciesMapConfigs;

export type Policy<P extends PolicyName = PolicyName> = {
    name: P;
    config: PoliciesMapConfigs[P];
}

export type Metadata = {
    groupKey: string;
}

export type Input = {
    appId: string;
    policy: Policy;
    metadata: Metadata;
};

export interface Client {
    policy<P extends PolicyName>(name: P, config: PoliciesMapConfigs[P]): Policy<P>;
    submit(input: Input): Promise<any>;
    getReplays(): Promise<any>;
}