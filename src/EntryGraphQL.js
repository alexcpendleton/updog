// class EntryGraphQL {
//     buildPullQuery(userId) {
//         return (doc) => {
//             if (!doc) {
//                 doc = {
//                     id: '',
//                     updatedAt: new Date(0).toUTCString()
//                 };
//             }

//             const query = `{
//                 todos(
//                     where: {
//                         _or: [
//                             {updatedAt: {_gt: "${doc.updatedAt}"}},
//                             {
//                                 updatedAt: {_eq: "${doc.updatedAt}"},
//                                 id: {_gt: "${doc.id}"}
//                             }
//                         ],
//                         userId: {_eq: "${userId}"}
//                     },
//                     limit: ${batchSize},
//                     order_by: [{updatedAt: asc}, {id: asc}]
//                 ) {
//                     id
//                     selectables
//                     note
//                     when

//                     isDeleted
//                     createdAt
//                     updatedAt

//                     userId
//                 }
//             }`;
//             return {
//                 query,
//                 variables: {}
//             };
//         };

//     }
//     buildPushQuery(doc) {
//     const query = `
//         mutation InsertEntry($record: [todos_insert_input!]!) {
//             insert_todos(
//                 objects: $todo,
//                 on_conflict: {
//                     constraint: todos_pkey,
//                     update_columns: [text, isCompleted, deleted, updatedAt]
//                 }){
//                 returning {
//                   id
//                 }
//               }
//        }
//     `;
//     const variables = {
//         todo: doc
//     };

//     return {
//         query,
//         variables
//     };
// };
