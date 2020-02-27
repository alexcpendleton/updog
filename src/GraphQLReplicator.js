import { plugin } from "rxdb";
import RxDBReplicationGraphQL from "rxdb/plugins/replication-graphql";
plugin(RxDBReplicationGraphQL);

export class GraphQLReplicator {
  constructor(db) {
    this.db = db;
    this.replicationState = null;
    this.batchSize = 10;
    this.pushQueryBuilder = this.pushQueryBuilder.bind(this);
    this.pullQueryBuilder = this.pullQueryBuilder.bind(this);
  }

  async restart(auth) {
    if (this.replicationState) {
      this.replicationState.cancel();
    }
    this.replicationState = await this.setupGraphQLReplication(auth);
  }

  pushQueryBuilder(doc, auth) {
    const query = `

    mutation insert_entries($objects: [entries_insert_input!]!) {
      insert_entries(
        objects: $objects,
        on_conflict: {
            constraint: entries_pkey,
            update_columns: [note, selectables, isDeleted, when, createdAt, updatedAt, userId]
        }) {
        returning {
          id
        }
      }
    }

    `;
    let insert_input = {
      id: doc.id,
      note: doc.note,
      selectables: doc.selectables,
      isDeleted: doc.isDeleted,
      updatedAt: doc.updatedAt,
      createdAt: doc.createdAt,
      userId: auth.userId
    };
    if (doc.when.toUTCString) {
      insert_input.when = doc.when.toUTCString();
    } else {
      insert_input.when = doc.when;
    }
    const variables = {
      objects: [insert_input]
    };

    return {
      query,
      variables
    };
  }
  pullQueryBuilder(userId) {
    let batchSize = this.batchSize;
    return doc => {
      if (!doc) {
        doc = {
          id: "",
          updatedAt: new Date(0).toUTCString()
        };
      }

      const query = `{
              entries(
                  where: {
                      _or: [
                          {updatedAt: {_gt: "${doc.updatedAt}"}},
                          {
                              updatedAt: {_eq: "${doc.updatedAt}"},
                              id: {_gt: "${doc.id}"}
                          }
                      ],
                      userId: {_eq: "${userId}"} 
                  },
                  limit: ${batchSize},
                  order_by: [{updatedAt: asc}, {id: asc}]
              ) {
                  id
                  note
                  when
                  selectables
                  isDeleted
                  createdAt
                  updatedAt
                  userId
              }
          }`;
      return {
        query,
        variables: {}
      };
    };
  }
  async setupGraphQLReplication(auth) {
    const syncURL = "https://updog-heroku-postgres.herokuapp.com/v1/graphql";
    const buildPushQuery = doc => {
      return this.pushQueryBuilder(doc, auth);
    };
    const replicationState = this.db.entries.syncGraphQL({
      url: syncURL,
      headers: {
        Authorization: `Bearer ${auth.idToken}`
      },
      push: {
        batchSize: this.batchSize,
        queryBuilder: buildPushQuery
      },
      pull: {
        queryBuilder: this.pullQueryBuilder(auth.userId)
      },
      live: false,
      retry: false,
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
    //replicationState.active$.subscribe();
    //replicationState.recieved$.subscribe(val => console.log("recieved", val));
    return replicationState;
  }
}

export default GraphQLReplicator;
