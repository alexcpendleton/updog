export class GraphQLReplicator {
  constructor(db) {
    this.db = db;
    this.replicationState = null;
    //this.subscriptionClient = null;
  }

  async restart(auth) {
    if (this.replicationState) {
      this.replicationState.cancel();
    }

    // if(this.subscriptionClient) {
    //     this.subscriptionClient.close()
    // }

    this.replicationState = await this.setupGraphQLReplication(auth);
    // this.subscriptionClient = this.setupGraphQLSubscription(auth, this.replicationState)
  }

  async setupGraphQLReplication(auth) {
    const replicationState = this.db.entries.syncGraphQL({
      url: syncURL,
      headers: {
        Authorization: `Bearer ${auth.idToken}`
      },
      push: {
        batchSize,
        queryBuilder: pushQueryBuilder
      },
      pull: {
        queryBuilder: pullQueryBuilder(auth.userId)
      },
      live: false,
      /**
       * Because the websocket is used to inform the client
       * when something has changed,
       * we can set the liveIntervall to a high value
       */
      liveInterval: 1000 * 60 * 10, // 10 minutes
      deletedFlag: "isDeleted"
    });

    replicationState.error$.subscribe(err => {
      console.error("replication error:");
      console.dir(err);
    });

    return replicationState;
  }

  // setupGraphQLSubscription(auth, replicationState) {
  //     const endpointUrl = 'wss://hasura1234567.herokuapp.com/v1/graphql';
  //     const wsClient = new SubscriptionClient(endpointUrl, {
  //         reconnect: true,
  //         connectionParams: {
  //             headers: {
  //                 'Authorization': `Bearer ${auth.idToken}`
  //             }
  //         },
  //         timeout: 1000 * 60,
  //         onConnect: () => {
  //             console.log('SubscriptionClient.onConnect()');
  //         },
  //         connectionCallback: () => {
  //             console.log('SubscriptionClient.connectionCallback:');
  //         },
  //         reconnectionAttempts: 10000,
  //         inactivityTimeout: 10 * 1000,
  //         lazy: true
  //     });

  //     const query = `subscription onTodoChanged {
  //         todos {
  //             id
  //             deleted
  //             isCompleted
  //             text
  //         }
  //     }`;

  //     const ret = wsClient.request({ query });

  //     ret.subscribe({
  //         next(data) {
  //             console.log('subscription emitted => trigger run');
  //             console.dir(data);
  //             replicationState.run();
  //         },
  //         error(error) {
  //             console.log('got error:');
  //             console.dir(error);
  //         }
  //     });

  //     return wsClient
  // }
}

export default GraphQLReplicator;
