import { setTimeout } from 'timers/promises';
import { peerId2Hash } from 'assertion-tools';

class ShardingTableService {
    constructor(ctx) {
        this.config = ctx.config;
        this.logger = ctx.logger;
        this.blockchainModuleManager = ctx.blockchainModuleManager;
        this.repositoryModuleManager = ctx.repositoryModuleManager;
        this.networkModuleManager = ctx.networkModuleManager;
        this.eventEmitter = ctx.eventEmitter;
    }

    async initialize(blockchainId) {
        // await this.pullBlockchainShardingTable(blockchainId);
        this.listenOnEvents(blockchainId);
    }

    async pullBlockchainShardingTable(blockchainId) {
        // const shardingTable = await this.blockchainModuleManager.getShardingTableFull(blockchain);
        await setTimeout(5 * 1000);
        const shardingTable = [];
        for (const connections of this.networkModuleManager.getPeers().values()) {
            const id = connections[0].remotePeer;
            const ask = 1;
            const stake = 3000;
            // eslint-disable-next-line no-await-in-loop
            const sha = await peerId2Hash(id);
            shardingTable.push({ id, ask, stake, blockchainId, sha });
        }

        for (const peer of shardingTable) {
            this.repositoryModuleManager.createPeerRecord(
                peer.id._idB58String,
                blockchainId,
                peer.ask,
                peer.stake,
                Date.now(),
                peer.sha,
            );
        }

        // const hash = await this.networkModuleManager.toHash(
        //     new TextEncoder().encode(
        //         '0x41af3e2d170aad38821133f8f59923b342e04aae1a16e7bde1bebc558d97a0d5',
        //     ),
        // );

        // const nodes = await this.repositoryModuleManager.getAllPeerRecords();
        // console.log("nodes: ", nodes);

        // const neighborhood = await this.findNeighbourhood(`0x${await hash.toString('hex')}`, 10);

        // console.log("neighborhood: ", neighborhood);
    }

    listenOnEvents(blockchainId) {
        this.eventEmitter.on(`${blockchainId}-PeerObjCreated`, (event) => {
            const eventData = JSON.parse(event.data);
            this.repositoryModuleManager.createPeerRecord(
                eventData.peerId,
                event.blockchain_id,
                eventData.ask,
                eventData.stake,
                Date.now(),
                eventData.sha,
            );

            this.repositoryModuleManager.markBlockchainEventAsProcessed(event.id);
        });

        this.eventEmitter.on(`${blockchainId}-PeerParamsUpdated`, (event) => {
            const eventData = JSON.parse(event.data);
            this.repositoryModuleManager.updatePeerParams(
                eventData.peerId,
                eventData.ask,
                eventData.stake,
            );

            this.repositoryModuleManager.markBlockchainEventAsProcessed(event.id);
        });

        this.eventEmitter.on('PeerRemoved', (event) => {
            const eventData = JSON.parse(event.data);
            this.repositoryModuleManager.removePeerRecord(eventData.peerId);

            this.repositoryModuleManager.markBlockchainEventAsProcessed(event.id);
        });
    }

    async findNeighbourhood(assertionId, r2) {
        return this.repositoryModuleManager.getNeighbourhood(assertionId, 24 * 60 * 60 * 1000, r2);
    }

    async getBidSuggestion(neighbourhood, R0, higherPercentile) {
        const neighbourhoodSortedByAsk = neighbourhood.sort(
            (node_one, node_two) => node_one.ask < node_two.ask,
        );

        const eligibleNodes = neighbourhoodSortedByAsk.slice(
            0,
            Math.ceil((higherPercentile / 100) * neighbourhood.length),
        );

        const eligibleNodesSortedByStake = eligibleNodes.sort(
            (node_one, node_two) => node_one.stake > node_two.stake,
        );

        const awardedNodes = eligibleNodesSortedByStake.slice(0, R0);

        return Math.max(...awardedNodes.map((node) => node.ask)) * R0;
    }

    async findEligibleNodes(neighbourhood, bid, R1, R0) {
        return neighbourhood.filter((node) => node.ask <= bid / R0).slice(0, R1);
    }
}

export default ShardingTableService;
